import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'uma-chave-secreta-bem-segura'
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL') or 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
