import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/task_manager_db'    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False