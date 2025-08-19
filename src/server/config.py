import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'chave_padrao_DB'
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL') or 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
