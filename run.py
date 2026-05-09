from app import create_app, socketio, db
import app.sockets  # Register socket events

flask_app = create_app()

if __name__ == '__main__':
    with flask_app.app_context():
        db.create_all()  # Creates tables if they don't exist
        print("✅ Database tables ready.")

    print("🚀 Starting Smart Task Manager...")
    socketio.run(flask_app, debug=True, host='0.0.0.0', port=5000)