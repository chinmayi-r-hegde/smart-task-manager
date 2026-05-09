// ── WebSocket Setup ────────────────────────────────────────────
const socket = io();
let allTasks = [];
let currentFilter = 'all';

socket.on('connect', () => {
    setLiveStatus('live', '● Live updates active');
});
socket.on('disconnect', () => {
    setLiveStatus('offline', '○ Disconnected');
});

socket.on('task_added', (task) => {
    showNotification(`✅ New task added: "${task.title}"`);
    loadTasks();
    animateStatCards();
});

socket.on('task_updated', (task) => {
    showNotification(`✏️ Task updated: "${task.title}"`);
    loadTasks();
    animateStatCards();
});

socket.on('task_deleted', (data) => {
    showNotification(`🗑️ Task deleted successfully.`);
    loadTasks();
    animateStatCards();
});


// ── Live Status ────────────────────────────────────────────────
function setLiveStatus(state, text) {
    const dot   = document.getElementById('live-dot');
    const label = document.getElementById('live-text');
    dot.className   = `dot dot-${state}`;
    label.textContent = text;
}


// ── API Helper ─────────────────────────────────────────────────
async function api(method, url, body = null) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.json();
}


// ── Load Tasks ─────────────────────────────────────────────────
async function loadTasks() {
    const data = await api('GET', '/api/tasks');
    allTasks = data.tasks || [];
    renderTasks(allTasks);
    loadAnalytics();
}


// ── Add Task ───────────────────────────────────────────────────
async function addTask() {
    const title    = document.getElementById('task-title').value.trim();
    const desc     = document.getElementById('task-desc').value.trim();
    const priority = document.getElementById('task-priority').value;

    if (!title) {
        showNotification('⚠️ Please enter a task title!');
        return;
    }

    await api('POST', '/api/tasks', { title, description: desc, priority });

    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value  = '';
}


// ── Delete Task ────────────────────────────────────────────────
async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    await api('DELETE', `/api/tasks/${id}`);
}


// ── Open Edit Modal ────────────────────────────────────────────
function openEdit(task) {
    document.getElementById('edit-id').value       = task.id;
    document.getElementById('edit-title').value    = task.title;
    document.getElementById('edit-desc').value     = task.description || '';
    document.getElementById('edit-priority').value = task.priority;
    document.getElementById('edit-status').value   = task.status;
    document.getElementById('edit-modal').classList.remove('hidden');
}


// ── Save Edit ──────────────────────────────────────────────────
async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const payload = {
        title:       document.getElementById('edit-title').value,
        description: document.getElementById('edit-desc').value,
        priority:    document.getElementById('edit-priority').value,
        status:      document.getElementById('edit-status').value
    };
    await api('PUT', `/api/tasks/${id}`, payload);
    closeModal();
}


// ── Close Modal ────────────────────────────────────────────────
function closeModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}


// ── Render Tasks ───────────────────────────────────────────────
function renderTasks(tasks) {
    const list     = document.getElementById('task-list');
    const filtered = currentFilter === 'all'
        ? tasks
        : tasks.filter(t => t.status === currentFilter);

    if (!filtered.length) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No tasks found.</p>
            </div>`;
        return;
    }

    list.innerHTML = filtered.map(t => `
        <div class="task-card ${t.status === 'completed' ? 'completed' : ''}">
            <div class="task-info">
                <div class="task-title">${escapeHtml(t.title)}</div>
                <div class="task-desc">${escapeHtml(t.description || '')}</div>
                <div class="task-meta">
                    <span class="badge badge-${t.priority}">${t.priority}</span>
                    <span class="badge badge-${t.status}">${t.status.replace('_', ' ')}</span>
                    <span class="task-date">📅 ${t.created_at}</span>
                </div>
            </div>
            <div class="task-right">
                <div class="task-actions">
                    <button class="btn-edit"   onclick='openEdit(${JSON.stringify(t)})'>✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteTask(${t.id})">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}


// ── Filter Tasks ───────────────────────────────────────────────
function filterTasks(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks(allTasks);
}


// ── Load Analytics ─────────────────────────────────────────────
async function loadAnalytics() {
    const data = await api('GET', '/api/analytics');

    // Update stats row
    document.getElementById('stat-total').textContent    = data.total;
    document.getElementById('stat-pending').textContent  = data.pending;
    document.getElementById('stat-progress').textContent = data.in_progress;
    document.getElementById('stat-done').textContent     = data.completed;

    // Progress bar
    const pct = data.completion_percentage;
    document.getElementById('stat-pct').textContent      = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';

    // Analytics section
    document.getElementById('donut-pct').textContent  = pct + '%';
    document.getElementById('avg-priority').textContent = data.avg_tasks_per_priority;

    // Donut chart
    const circle = document.getElementById('donut-circle');
    const circumference = 251.2;
    const offset = circumference - (pct / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Priority bars
    const total = data.total || 1;
    const pb    = data.priority_breakdown;
    document.getElementById('count-high').textContent   = pb.high;
    document.getElementById('count-medium').textContent = pb.medium;
    document.getElementById('count-low').textContent    = pb.low;
    document.getElementById('bar-high').style.width   = (pb.high   / total * 100) + '%';
    document.getElementById('bar-medium').style.width = (pb.medium / total * 100) + '%';
    document.getElementById('bar-low').style.width    = (pb.low    / total * 100) + '%';
}


// ── Show/Hide Sections ─────────────────────────────────────────
function showSection(name) {
    document.getElementById('section-tasks').style.display     = name === 'tasks'     ? 'block' : 'none';
    document.getElementById('section-analytics').style.display = name === 'analytics' ? 'block' : 'none';

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.getElementById('page-title').textContent = name === 'tasks' ? 'My Tasks' : 'Analytics';
    document.getElementById('page-sub').textContent   = name === 'tasks'
        ? 'Manage and track your work'
        : 'Insights powered by Pandas & NumPy';
}


// ── Notification ───────────────────────────────────────────────
let notifTimer;
function showNotification(msg) {
    const el = document.getElementById('notification');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}


// ── Escape HTML ────────────────────────────────────────────────
function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
}


// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadTasks);
// ── Profile Menu ───────────────────────────────────────────────
function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('hidden');
}

// Close profile menu when clicking outside
document.addEventListener('click', function(e) {
    const menu = document.getElementById('profile-menu');
    const user = document.querySelector('.sidebar-user');
    if (!menu.contains(e.target) && !user.contains(e.target)) {
        menu.classList.add('hidden');
    }
});
// ── Animate Stat Cards on Update ───────────────────────────────
function animateStatCards() {
    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.transform = 'scale(1.05)';
        card.style.borderColor = 'var(--accent)';
        setTimeout(() => {
            card.style.transform = '';
            card.style.borderColor = '';
        }, 400);
    });
}