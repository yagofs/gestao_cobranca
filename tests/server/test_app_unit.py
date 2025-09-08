from datetime import date
import os
import sys
import pytest

# Garante que `from models import ...` em app.py funcione adicionando src/server ao sys.path
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
SERVER_DIR = os.path.join(PROJECT_ROOT, "src", "server")
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

import app as app_module  # noqa: E402


@pytest.fixture
def app(monkeypatch):
    # Garante que não usamos um BD real, simulando (stub) os métodos de db.session usados no código
    monkeypatch.setattr(app_module, "db", type("DBStub", (), {
        "session": type("Sess", (), {"add": lambda self, x: None, "add_all": lambda self, x: None, "commit": lambda self: None})()
    })())
    # Retorna a instância do Flask app do módulo
    return app_module.app


@pytest.fixture
def client(app):
    return app.test_client()


def test_index_route(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"Bem-vindo ao Backend de Cobran\xc3\xa7a" in resp.data


def _auth_header():
    # Cria um token JWT válido usando o contexto da aplicação
    with app_module.app.app_context():
        token = app_module.create_access_token(identity="tester")
    return {"Authorization": f"Bearer {token}"}


def test_get_clients_no_db(monkeypatch, client):
    # Faz patch de Client.query
    class _ClientQuery:
        def all(self):
            C = type("Client", (), {})
            c1 = C(); c1.id = 1; c1.name = "Ana"; c1.cpf = "111"; c1.phones = "123,456"
            c2 = C(); c2.id = 2; c2.name = "Bia"; c2.cpf = "222"; c2.phones = None
            return [c1, c2]

    class _Client:
        query = _ClientQuery()

    monkeypatch.setattr(app_module, "Client", _Client)

    resp = client.get("/api/clients", headers=_auth_header())
    assert resp.status_code == 200
    data = resp.get_json()
    assert data[0]["phones"] == ["123", "456"]
    assert data[1]["phones"] == []


def test_get_client_by_cpf_missing_param(monkeypatch, client):
    resp = client.get("/api/client_by_cpf", headers=_auth_header())
    assert resp.status_code == 400


def test_get_client_by_cpf_found(monkeypatch, client):
    class _Query:
        def filter_by(self, cpf):
            C = type("Client", (), {})
            c = C(); c.id = 10; c.name = "Nina"; c.cpf = cpf; c.phones = "1,2"
            return type("_", (), {"first": lambda self: c})()

    class _Client:
        query = type("Q", (), {"filter_by": lambda self, cpf=None: _Query().filter_by(cpf)})()

    monkeypatch.setattr(app_module, "Client", _Client)

    resp = client.get("/api/client_by_cpf?cpf=999", headers=_auth_header())
    assert resp.status_code == 200
    assert resp.get_json()["cpf"] == "999"


def test_get_client_by_cpf_not_found(monkeypatch, client):
    class _Query:
        def filter_by(self, cpf):
            return type("_", (), {"first": lambda self: None})()

    class _Client:
        query = type("Q", (), {"filter_by": lambda self, cpf=None: _Query().filter_by(cpf)})()

    monkeypatch.setattr(app_module, "Client", _Client)

    resp = client.get("/api/client_by_cpf?cpf=000", headers=_auth_header())
    assert resp.status_code == 404


def test_contract_helpers_builders():
    # Constrói um contrato fictício com parcelas para cobrir as funções auxiliares
    class Inst:
        def __init__(self, number, due_date, amount):
            self.number = number
            self.due_date = due_date
            self.amount = amount

    class Contract:
        def __init__(self):
            self.id = 1
            self.number = "C-1"
            self.type = "Loan"
            self.installments = [
                Inst(1, date(2024, 1, 1), 10.0),
                Inst(2, date(2024, 1, 15), 20.0),
            ]

    contract = Contract()
    data = app_module._build_contract_data(contract, "123")
    assert data["fineValue"] == pytest.approx(30.0 * 0.05)
    assert "installments" in data


def test_register_login_logout_and_protected(monkeypatch, client):
    # Simula User.query
    class _User:
        def __init__(self, username=None, **kwargs):
            self.username = username
            self.password_hash = "HASH::pw"
        def set_password(self, p):
            self.password_hash = f"HASH::{p}"
        def check_password(self, p):
            return self.password_hash == f"HASH::{p}"

    class _UserQuery:
        def __init__(self, existing=None):
            self._existing = existing
        def filter_by(self, username):
            user = self._existing.get(username)
            return type("_", (), {"first": lambda self: user})()

    # Para registro: inicialmente, não existe usuário
    users = {}
    class _UserModel:
        query = type("Q", (), {"filter_by": lambda self, username=None: _UserQuery(users).filter_by(username)})()
        def __call__(self, *args, **kwargs):
            return _User(*args, **kwargs)
    monkeypatch.setattr(app_module, "User", _UserModel())

    # Também cria stub de db.session
    monkeypatch.setattr(app_module, "db", type("DBStub", (), {"session": type("Sess", (), {"add": lambda self, x: users.__setitem__(x.username, x), "commit": lambda self: None})()})())

    # Register
    resp = client.post("/api/register", json={"username": "u1", "password": "p1"})
    assert resp.status_code == 201

    # Try duplicate
    resp = client.post("/api/register", json={"username": "u1", "password": "p1"})
    assert resp.status_code == 409

    # Login success
    def fake_create_access_token(identity):
        return f"token::{identity}"
    monkeypatch.setattr(app_module, "create_access_token", fake_create_access_token)

    # Faz patch de User.query no fluxo de login para enxergar o usuário criado
    monkeypatch.setattr(app_module, "User", type("User", (), {
        "query": type("Q", (), {"filter_by": lambda self, username=None: _UserQuery(users).filter_by(username)})()
    }))

    resp = client.post("/api/login", json={"username": "u1", "password": "p1"})
    assert resp.status_code == 200
    assert resp.get_json()["access_token"].startswith("token::")

    # Login invalid
    resp = client.post("/api/login", json={"username": "u1", "password": "wrong"})
    assert resp.status_code == 401

    # Logout (sem validar efeitos colaterais de cookies JWT; apenas a resposta)
    resp = client.post("/api/logout")
    assert resp.status_code == 200

    # A rota protegida apenas retorna a identidade de get_jwt_identity; simulamos isso
    monkeypatch.setattr(app_module, "get_jwt_identity", lambda: "u1")
    resp = client.get("/api/protected")
    assert resp.status_code == 200
    assert resp.get_json()["logged_in_as"] == "u1"


def test_actions_endpoints_without_db(monkeypatch, client):
    # Modelos e consultas (queries) simulados
    class _Action:
        def __init__(self, id=1, action_type="Ligacao", status="Concluida", notes="", operator="oper", timestamp=None):
            self.id = id
            self.action_type = action_type
            self.status = status
            self.notes = notes
            self.operator = operator
            from datetime import datetime
            self.timestamp = timestamp or datetime(2024, 1, 1, 10, 0, 0)
            self.client = type("C", (), {"name": "Nome", "cpf": "123"})()
            self.contract = type("K", (), {"number": "K-1"})()
            self.installment_number = 1

    class _Client:
        def __init__(self, id, name, cpf):
            self.id = id; self.name = name; self.cpf = cpf
        def __repr__(self):
            return f"<Client {self.name}>"

    class _Contract:
        def __init__(self, id, number, client_id):
            self.id = id; self.number = number; self.client_id = client_id

    # Armazenamento em memória
    store = {
        "clients": {"111": _Client(1, "Ana", "111")},
        "contracts": { (1, "C-10"): _Contract(5, "C-10", 1) },
        "actions": []
    }

    # Stubs para interfaces de consulta (query)
    class _ClientQuery:
        def filter_by(self, cpf=None):
            c = store["clients"].get(cpf)
            return type("_", (), {"first": lambda self: c})()
        def get_or_404(self, cid):
            c = next((v for v in store["clients"].values() if v.id == cid), None)
            if not c:
                raise AssertionError("should exist in test")
            return c

    class _ContractQuery:
        def filter_by(self, number=None, client_id=None):
            c = store["contracts"].get((client_id, number))
            return type("_", (), {"first": lambda self: c})()

    class _ActionQuery:
        def __init__(self, items):
            self._items = items
        def filter_by(self, **kwargs):
            def _match(a):
                for k, v in kwargs.items():
                    if getattr(a, k) != v:
                        return False
                return True
            return _ActionQuery([a for a in self._items if _match(a)])
        def order_by(self, *args, **kwargs):
            return _ActionQuery(sorted(self._items, key=lambda a: a.timestamp, reverse=True))
        def all(self):
            return list(self._items)
        def limit(self, n):
            return _ActionQuery(sorted(self._items, key=lambda a: a.timestamp, reverse=True)[:n])
        def count(self):
            return len(self._items)
        def filter(self, *expr):
            # Emula o filtro por "hoje" usado no endpoint today_count
            from datetime import date as _date
            today = _date.today()
            filtered = [a for a in self._items if a.timestamp.date() == today]
            return _ActionQuery(filtered)

    # Faz patch dos modelos no módulo
    monkeypatch.setattr(app_module, "Client", type("Client", (), {"query": _ClientQuery()}))
    monkeypatch.setattr(app_module, "Contract", type("Contract", (), {"query": _ContractQuery()}))

    class _ActionModel:
    # Fornece um objeto similar a coluna com suporte a desc()
        class _TimestampCol:
            def __ge__(self, other):
                return ("ge", other)
            def __lt__(self, other):
                return ("lt", other)
            def desc(self):
                return object()
        timestamp = _TimestampCol()
        query = _ActionQuery([])
        def __init__(self, **kwargs):
            a = _Action()
            for k, v in kwargs.items():
                setattr(a, k, v)
            self._instance = a
        def __getattr__(self, item):
            return getattr(self._instance, item)

    monkeypatch.setattr(app_module, "Action", _ActionModel)

    # Faz patch de db.session.add/commit para gravar no armazenamento em memória
    class _Sess:
        def add(self, a):
            store["actions"].append(a._instance)
        def commit(self):
            for idx, a in enumerate(store["actions"], 1):
                a.id = idx
    monkeypatch.setattr(app_module, "db", type("DB", (), {"session": _Sess()})())

    # Faz patch da identidade
    monkeypatch.setattr(app_module, "get_jwt_identity", lambda: "tester")

    # Criar ação: campos ausentes
    r = client.post("/api/actions", json={}, headers=_auth_header())
    assert r.status_code == 400

    # Criar ação: cliente não encontrado
    r = client.post("/api/actions", json={"clientCpf": "999", "actionType": "Ligacao"}, headers=_auth_header())
    assert r.status_code == 404

    # Criar ação: com contrato
    r = client.post("/api/actions", json={
        "clientCpf": "111",
        "actionType": "Ligacao",
        "contractNumber": "C-10",
        "selectedInstallmentNumber": 2,
        "status": "Concluída",
        "notes": "Ok"
    }, headers=_auth_header())
    assert r.status_code == 201
    payload = r.get_json()
    assert payload["msg"].startswith("Ação registrada")
    assert payload["action_id"] == 1

    # Buscar ações por cliente
    # Pré-carrega a query com itens criados
    monkeypatch.setattr(_ActionModel, "query", _ActionQuery(store["actions"]))
    r = client.get("/api/actions/1", headers=_auth_header())
    assert r.status_code == 200
    lst = r.get_json()
    assert isinstance(lst, list) and lst

    # Ações recentes
    r = client.get("/api/actions/recent", headers=_auth_header())
    assert r.status_code == 200
    assert len(r.get_json()) >= 1

    # Contagem de hoje
    from datetime import datetime, timedelta
    today = date.today()
    a_today = _Action(timestamp=datetime(today.year, today.month, today.day, 1))
    store["actions"].append(a_today)
    monkeypatch.setattr(_ActionModel, "query", _ActionQuery(store["actions"]))
    r = client.get("/api/actions/today_count", headers=_auth_header())
    assert r.status_code == 200
    assert "count" in r.get_json()


def test_get_overdue_installments(monkeypatch, client):
    class _Inst:
        def __init__(self, id, number, due_date, amount, contract_number, client_name, client_cpf):
            self.id = id; self.number = number; self.due_date = due_date; self.amount = amount
            self.contract = type("K", (), {"number": contract_number, "client": type("C", (), {"name": client_name, "cpf": client_cpf})()})()

    # Em atraso e não em atraso
    today = date.today()
    overdue = _Inst(1, 1, today.replace(day=max(1, today.day - 5)), 100.0, "C-1", "Ana", "111")
    due2 = _Inst(2, 2, today, 200.0, "C-1", "Ana", "111")

    class _Query:
        def filter(self, *expr):
            return type("_", (), {"all": lambda self: [overdue]})()

    class _Installment:
    # Emula o atributo de coluna usado na expressão de filtro com um stub comparável
        class _DueDate:
            def __lt__(self, other):
                return ("lt", other)
        due_date = _DueDate()
        query = _Query()

    monkeypatch.setattr(app_module, "Installment", _Installment)

    r = client.get("/api/overdue_installments", headers=_auth_header())
    assert r.status_code == 200
    arr = r.get_json()
    assert arr and arr[0]["clientName"] == "Ana"
