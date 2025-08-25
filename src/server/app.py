
from flask import Flask, request, jsonify, Response
from flask_migrate import Migrate
from models import db, User, Client, Contract, Installment, Action
from config import Config
from datetime import date, datetime
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity, unset_jwt_cookies
from flask_cors import CORS
import os
from datetime import timedelta


app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

app.config["JWT_SECRET_KEY"] = os.environ.get(
    'JWT_SECRET_KEY',  'sua-super-chave-secreta-para-jwt')
jwt = JWTManager(app)

CORS(app)


@app.route('/')
def index():
    return "Bem-vindo ao Backend de Cobrança!"


@app.route('/api/clients', methods=['GET'])
@jwt_required()
def get_clients():
    clients = Client.query.all()
    return jsonify(
        [
            {
                'id': client.id,
                'name': client.name,
                'cpf': client.cpf,
                'phones': client.phones.split(',') if client.phones else []
            } for client in clients
        ]
    )


@app.route('/api/client_by_cpf', methods=['GET'])
@jwt_required()
def get_client_by_cpf():
    client_cpf = request.args.get('cpf')
    if not client_cpf:
        return jsonify({"msg": "CPF do cliente é obrigatório"}), 400

    client = Client.query.filter_by(cpf=client_cpf).first()
    if not client:
        return jsonify({"msg": f"Cliente com CPF {client_cpf} não encontrado"}), 404

    return jsonify({
        'id': client.id,
        'name': client.name,
        'cpf': client.cpf,
        'phones': client.phones.split(',') if client.phones else []
    })


@app.route('/api/contracts', methods=['GET'])
@jwt_required()
def get_contracts():
    client_cpf = request.args.get('cpf')
    if not client_cpf:
        return jsonify({"msg": "CPF do cliente é obrigatório"}), 400

    client = Client.query.filter_by(cpf=client_cpf).first()
    if not client:
        return jsonify({"msg": f"Cliente com CPF {client_cpf} não encontrado"}), 404

    contracts_data = [_build_contract_data(contract, client.cpf) for contract in client.contracts]
    delinquent_contracts = _filter_delinquent_contracts(contracts_data)

    return jsonify(delinquent_contracts)


def _build_contract_data(contract, client_cpf):
    total_amount = _calculate_total_amount(contract)
    overdue_info = _get_overdue_info(contract)
    status_info = _determine_contract_status(contract, overdue_info)
    
    return {
        'id': contract.id,
        'number': contract.number,
        'clientCpf': client_cpf,
        'type': contract.type,
        'installmentValue': total_amount,
        'dueDate': overdue_info['due_date'],
        'daysOverdue': overdue_info['days_overdue'],
        'fineValue': _calculate_fine_value(total_amount, overdue_info['days_overdue']),
        'status': status_info['status'],
        'updatedValue': total_amount * 1.10,
        'installments': _build_installments_data(contract.installments)
    }


def _calculate_total_amount(contract):
    return sum(inst.amount for inst in contract.installments)


def _get_overdue_info(contract):
    current_date = date.today()
    earliest_overdue = _find_earliest_overdue_installment(contract.installments, current_date)
    
    if earliest_overdue:
        return {
            'installment': earliest_overdue,
            'due_date': earliest_overdue.due_date.isoformat(),
            'days_overdue': (current_date - earliest_overdue.due_date).days
        }
    
    return {
        'installment': None,
        'due_date': '',
        'days_overdue': 0
    }


def _find_earliest_overdue_installment(installments, current_date):
    overdue_installments = [
        inst for inst in installments 
        if inst.due_date < current_date
    ]
    
    if not overdue_installments:
        return None
        
    return min(overdue_installments, key=lambda x: x.due_date)


def _determine_contract_status(contract, overdue_info):
    if overdue_info['days_overdue'] > 0:
        return {'status': 'overdue'}
    
    if _has_recent_installments(contract.installments):
        return {'status': 'recent'}
    
    return {'status': 'Em dia'}


def _has_recent_installments(installments):
    current_date = date.today()
    
    for inst in installments:
        if inst.due_date >= current_date:
            days_until_due = (inst.due_date - current_date).days
            if days_until_due <= 30:
                return True
    
    return False


def _calculate_fine_value(total_amount, days_overdue):
    return total_amount * 0.05 if days_overdue > 0 else 0


def _build_installments_data(installments):
    current_date = date.today()
    
    return [
        {
            'number': inst.number,
            'dueDate': inst.due_date.isoformat(),
            'daysOverdue': _calculate_days_overdue(inst.due_date, current_date),
            'amount': inst.amount
        } 
        for inst in installments
    ]


def _calculate_days_overdue(due_date, current_date):
    return (current_date - due_date).days if due_date < current_date else 0


def _filter_delinquent_contracts(contracts_data):
    return [
        contract for contract in contracts_data
        if _is_delinquent_contract(contract)
    ]


def _is_delinquent_contract(contract):
    if contract['status'] == 'overdue':
        return True
        
    return len(contract['installments']) == 1 and contract['status'] != 'Em dia'

@app.route("/api/register", methods=["POST"])
def register():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    if not username or not password:
        return jsonify({"msg": "Nome de usuário e senha são obrigatórios"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Nome de usuário já existe"}), 409

    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuário registrado com sucesso"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    user = User.query.filter_by(username=username).first()

    if user is None or not user.check_password(password):
        return jsonify({"msg": "Nome de usuário ou senha inválidos"}), 401

    access_token = create_access_token(identity=user.username)
    return jsonify(access_token=access_token)


@app.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "Logout bem-sucedido"})
    unset_jwt_cookies(response)
    return response


@app.route("/api/protected", methods=["GET"])
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@app.route("/api/actions", methods=["POST"])
@jwt_required()
def create_action():
    data = request.get_json()

    client_cpf = data.get('clientCpf')
    contract_number = data.get('contractNumber')
    installment_number = data.get('selectedInstallmentNumber')
    action_type = data.get('actionType')
    status = data.get('status', 'Concluída')
    notes = data.get('notes', '')

    if not client_cpf or not action_type:
        return jsonify({"msg": "CPF do cliente e tipo de ação são obrigatórios"}), 400

    client = Client.query.filter_by(cpf=client_cpf).first()
    if not client:
        return jsonify({"msg": f"Cliente com CPF {client_cpf} não encontrado"}), 404

    contract = None
    contract_id = None
    if contract_number:
        contract = Contract.query.filter_by(
            number=contract_number, client_id=client.id).first()
        if not contract:
            return jsonify({"msg": f"Contrato {contract_number} para o cliente {client_cpf} não encontrado"}), 404
        contract_id = contract.id

    operator_username = get_jwt_identity() or "Operador Desconhecido"
    new_action = Action(
        client_id=client.id,
        action_type=action_type,
        status=status,
        notes=notes,
        contract_id=contract_id,
        installment_number=installment_number,
        operator=operator_username
    )

    db.session.add(new_action)
    db.session.commit()

    return jsonify({"msg": "Ação registrada com sucesso", "action_id": new_action.id}), 201


@app.route("/api/actions/<int:client_id>", methods=["GET"])
@jwt_required()
def get_actions_by_client(client_id):
    client = Client.query.get_or_404(client_id)

    contract_id = request.args.get('contract_id', type=int)
    installment_number = request.args.get('installment_number', type=int)

    query = Action.query.filter_by(client_id=client.id)

    if contract_id:
        query = query.filter_by(contract_id=contract_id)
    if installment_number:
        query = query.filter_by(installment_number=installment_number)

    actions = query.order_by(Action.timestamp.desc()).all()

    actions_data = []
    for action in actions:
        actions_data.append({
            'id': action.id,
            'actionType': action.action_type,
            'timestamp': action.timestamp.isoformat(),
            'status': action.status,
            'notes': action.notes,
            'clientName': client.name,
            'clientCpf': client.cpf,
            'contractNumber': action.contract.number if action.contract else None,
            'installmentNumber': action.installment_number,
            'operator': action.operator
        })
    return jsonify(actions_data)


@app.route("/api/actions/today_count", methods=["GET"])
@jwt_required()
def get_today_actions_count():
    current_date = date.today()
    today_actions_count = Action.query.filter(
        Action.timestamp >= current_date,
        Action.timestamp < current_date + timedelta(days=1)
    ).count()
    return jsonify({"count": today_actions_count})


@app.route('/api/overdue_installments', methods=['GET'])
@jwt_required()
def get_overdue_installments():
    current_date = date.today()

    overdue_installments = Installment.query.filter(
        Installment.due_date < current_date).all()

    installments_data = []
    for inst in overdue_installments:
        client_name = inst.contract.client.name
        client_cpf = inst.contract.client.cpf
        days_overdue = (current_date - inst.due_date).days

        installments_data.append({
            'id': inst.id,
            'clientName': client_name,
            'cpf': client_cpf,
            'contractNumber': inst.contract.number,
            'installmentNumber': inst.number,
            'dueDate': inst.due_date.isoformat(),
            'daysOverdue': days_overdue,
            'amount': inst.amount
        })

    sorted_installments = sorted(
        installments_data, key=lambda x: x['daysOverdue'])

    return jsonify(sorted_installments)


@app.route("/api/actions/recent", methods=["GET"])
@jwt_required()
def get_recent_actions():
    actions = Action.query.order_by(Action.timestamp.desc()).limit(10).all()
    actions_data = []
    for action in actions:
        actions_data.append({
            "id": action.id,
            "actionType": action.action_type,
            "timestamp": action.timestamp.isoformat(),
            "clientName": action.client.name if action.client else "",
            "clientCpf": action.client.cpf if action.client else "",
            "status": action.status,
            "notes": action.notes,
            "operator": action.operator,
        })
    return jsonify(actions_data)


if __name__ == '__main__':

    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username="teste_user").first():
            print("Adicionando usuário de teste...")
            test_user = User(username="teste_user")
            test_user.set_password("senha_teste")
            db.session.add(test_user)
            db.session.commit()
            print("Usuário 'teste_user' criado com sucesso.")

        if not Client.query.first():
            print("Adicionando dados iniciais...")
            client1 = Client(name="Maria Silva Santos", cpf="123.456.789-01",
                             phones="(62) 99999-1234,(62) 3333-5678")
            client2 = Client(name="João Carlos Oliveira",
                             cpf="987.654.321-02", phones="(62) 98888-2345")
            db.session.add_all([client1, client2])
            db.session.commit()

            contract1 = Contract(number="123456789",
                                 type="Crédito Rural", client=client1)
            contract2 = Contract(number="987654321",
                                 type="Financiamento Veículo", client=client1)
            contract3 = Contract(number="456789123",
                                 type="Conta Corrente", client=client2)
            # Contrato de parcela única
            contract4 = Contract(number="111222333",
                                 type="Empréstimo Pessoal", client=client1)
            db.session.add_all([contract1, contract2, contract3, contract4])
            db.session.commit()

            inst1_1 = Installment(contract=contract1, number=1, due_date=date(
                2024, 9, 15), amount=15420.50)
            inst1_2 = Installment(contract=contract1, number=2, due_date=date(
                2024, 10, 15), amount=15420.50)
            inst1_3 = Installment(contract=contract1, number=3, due_date=date(
                2024, 11, 15), amount=15420.50)
            inst1_4 = Installment(contract=contract1, number=4, due_date=date(
                2024, 12, 15), amount=15420.50)

            inst2_1 = Installment(contract=contract2, number=1, due_date=date(
                2024, 10, 1), amount=2890.75)
            inst2_2 = Installment(contract=contract2, number=2, due_date=date(
                2024, 11, 1), amount=2890.75)
            inst2_3 = Installment(contract=contract2, number=3, due_date=date(
                2024, 12, 1), amount=2890.75)

            inst3_1 = Installment(contract=contract3, number=1, due_date=date(
                2024, 12, 10), amount=5670.00)
            inst3_2 = Installment(contract=contract3, number=2, due_date=date(
                2025, 1, 10), amount=5670.00)

            inst4_1 = Installment(contract=contract4, number=1, due_date=date(
                2024, 11, 20), amount=1000.00)

            db.session.add_all([inst1_1, inst1_2, inst1_3, inst1_4,
                               inst2_1, inst2_2, inst2_3, inst3_1, inst3_2, inst4_1])
            db.session.commit()
            print("Dados iniciais adicionados com sucesso.")

    app.run(debug=True)
