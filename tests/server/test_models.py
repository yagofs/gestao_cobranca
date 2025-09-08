import os
import sys
import pytest
from datetime import date

# Garante que podemos importar models.py diretamente
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
SERVER_DIR = os.path.join(PROJECT_ROOT, "src", "server")
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

import models as models_module  # noqa: E402
from models import User, Client, Contract, Installment, Action  # noqa: E402


def test_user_password_hash_and_check(monkeypatch):
    user = User(username="alice")

    # Faz monkeypatch de generate_password_hash/check_password_hash para evitar criptografia pesada
    monkeypatch.setattr(models_module, "generate_password_hash", lambda p: f"HASH::{p}")
    monkeypatch.setattr(models_module, "check_password_hash", lambda h, p: h == f"HASH::{p}")

    user.set_password("secret")
    assert user.password_hash == "HASH::secret"
    assert user.check_password("secret") is True
    assert user.check_password("wrong") is False


def test_client_repr():
    c = Client(name="Bob", cpf="123.456.789-00", phones="111,222")
    assert "Client" in repr(c)
    assert "Bob" in repr(c)


def test_contract_and_installment_repr_relationship_mock():
    # Cria um Contract e um Installment sem tocar em um BD real
    contract = Contract(number="C-001", type="Loan")
    # Anexa uma instância real de Client (mapeada pelo SQLAlchemy) para evitar erros de instrumentação
    real_client = Client(name="Carol", cpf="000.000.000-00", phones=None)
    contract.client = real_client

    inst = Installment(number=1, due_date=date(2024, 1, 1), amount=100.0)
    # Backref para repr: Installment.__repr__ usa self.contract.number
    inst.contract = contract
    assert "Contract C-001" in repr(inst)
    assert "Contract" in repr(contract)


def test_action_repr_and_fields():
    action = Action(action_type="Ligacao", status="Concluída", notes="OK", operator="op1")
    # Anexa uma instância real de Client para que __repr__ acesse client.name
    action.client = Client(name="Diego", cpf="111.111.111-11", phones=None)

    assert "Action Ligacao" in repr(action)
    assert action.status == "Concluída"
    assert action.notes == "OK"
    assert action.operator == "op1"
