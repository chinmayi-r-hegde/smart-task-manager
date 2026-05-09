from flask_socketio import emit, join_room
from flask_login import current_user
from app import socketio


@socketio.on('connect')
def handle_connect():
    if current_user.is_authenticated:
        join_room(f'user_{current_user.id}')
        emit('connected', {'message': f'Welcome {current_user.username}! Live updates active.'})


@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected')


@socketio.on('ping_server')
def handle_ping(data):
    emit('pong', {'message': 'Server is alive!', 'received': data})