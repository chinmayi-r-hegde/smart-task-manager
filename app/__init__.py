from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_socketio import SocketIO
from config import Config

db            = SQLAlchemy()
migrate       = Migrate()
login_manager = LoginManager()
bcrypt        = Bcrypt()
socketio      = SocketIO()

login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'


def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object(Config)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    socketio.init_app(app, cors_allowed_origins='*', async_mode='eventlet')

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(tasks_bp, url_prefix='/api')

    # Main dashboard route
    from flask import redirect, url_for
    from flask_login import login_required

    @app.route('/')
    @login_required
    def index():
        return redirect(url_for('index_page'))

    @app.route('/dashboard')
    @login_required
    def index_page():
        from flask import render_template
        return render_template('dashboard.html')

    return app