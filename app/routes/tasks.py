from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db, socketio
from app.models import Task
from app.analytics import get_analytics

tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.created_at.desc()).all()
    return jsonify({'tasks': [t.to_dict() for t in tasks]}), 200


@tasks_bp.route('/tasks', methods=['POST'])
@login_required
def add_task():
    data = request.get_json(silent=True)

    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required.'}), 400

    priority = data.get('priority', 'medium')
    if priority not in ('low', 'medium', 'high'):
        return jsonify({'error': 'Priority must be low, medium, or high.'}), 400

    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        priority=priority,
        status='pending',
        user_id=current_user.id
    )
    db.session.add(task)
    db.session.commit()

    socketio.emit('task_added', task.to_dict(), broadcast=True)

    return jsonify({'message': 'Task created.', 'task': task.to_dict()}), 201


@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    data = request.get_json(silent=True)

    if not data:
        return jsonify({'error': 'No data provided.'}), 400

    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        if data['priority'] not in ('low', 'medium', 'high'):
            return jsonify({'error': 'Invalid priority.'}), 400
        task.priority = data['priority']
    if 'status' in data:
        if data['status'] not in ('pending', 'in_progress', 'completed'):
            return jsonify({'error': 'Invalid status.'}), 400
        task.status = data['status']

    db.session.commit()

    socketio.emit('task_updated', task.to_dict(), broadcast=True)

    return jsonify({'message': 'Task updated.', 'task': task.to_dict()}), 200


@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    task_data = task.to_dict()
    db.session.delete(task)
    db.session.commit()

    socketio.emit('task_deleted', {'id': task_id}, broadcast=True)

    return jsonify({'message': 'Task deleted.', 'task': task_data}), 200


@tasks_bp.route('/analytics', methods=['GET'])
@login_required
def analytics():
    data = get_analytics(current_user.id)
    return jsonify(data), 200