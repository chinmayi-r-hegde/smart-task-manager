import pandas as pd
import numpy as np
from app.models import Task


def get_analytics(user_id: int) -> dict:
    """
    Compute task analytics for a user using Pandas & NumPy.
    """
    tasks = Task.query.filter_by(user_id=user_id).all()

    if not tasks:
        return {
            'total': 0,
            'completed': 0,
            'pending': 0,
            'in_progress': 0,
            'completion_percentage': 0.0,
            'priority_breakdown': {'low': 0, 'medium': 0, 'high': 0},
            'avg_tasks_per_priority': 0.0
        }

    # Build DataFrame
    df = pd.DataFrame([t.to_dict() for t in tasks])

    # Core counts using NumPy
    total     = len(df)
    completed = int(np.sum(df['status'] == 'completed'))
    pending   = int(np.sum(df['status'] == 'pending'))
    in_prog   = int(np.sum(df['status'] == 'in_progress'))

    # Completion percentage
    completion_pct = round(float(np.divide(completed, total) * 100), 2)

    # Priority breakdown using Pandas value_counts
    priority_counts = df['priority'].value_counts().to_dict()
    priority_breakdown = {
        'low':    priority_counts.get('low', 0),
        'medium': priority_counts.get('medium', 0),
        'high':   priority_counts.get('high', 0)
    }

    # Average tasks per priority level
    avg_per_priority = round(float(np.mean(list(priority_breakdown.values()))), 2)

    return {
        'total':                  total,
        'completed':              completed,
        'pending':                pending,
        'in_progress':            in_prog,
        'completion_percentage':  completion_pct,
        'priority_breakdown':     priority_breakdown,
        'avg_tasks_per_priority': avg_per_priority
    }