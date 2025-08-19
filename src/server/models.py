from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    phones = db.Column(db.String(255))

    contracts = db.relationship('Contract', backref='client', lazy=True)
    actions = db.relationship('Action', backref='client', lazy=True)

    def __repr__(self):
        return f'<Client {self.name} ({self.cpf})>'


class Contract(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(50), unique=True, nullable=False)
    type = db.Column(db.String(100), nullable=False)

    client_id = db.Column(db.Integer, db.ForeignKey(
        'client.id'), nullable=False)

    installments = db.relationship(
        'Installment', backref='contract', lazy=True)

    def __repr__(self):
        return f'<Contract {self.number}>'


class Installment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)

    contract_id = db.Column(db.Integer, db.ForeignKey(
        'contract.id'), nullable=False)

    def __repr__(self):
        return f'<Installment {self.number} of Contract {self.contract.number}>'


class Action(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action_type = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50))
    notes = db.Column(db.String(500), nullable=True)
    operator = db.Column(db.String(80), nullable=False)

    client_id = db.Column(db.Integer, db.ForeignKey(
        'client.id'), nullable=False)
    contract_id = db.Column(
        db.Integer, db.ForeignKey('contract.id'), nullable=True)
    installment_number = db.Column(db.Integer, nullable=True)

    contract = db.relationship('Contract', backref='actions_rel', lazy=True)

    def __repr__(self):
        return f'<Action {self.action_type} for Client {self.client.name}>'
