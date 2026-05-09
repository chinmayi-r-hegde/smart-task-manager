# 🗂️ Smart Task Manager

A full-stack task management web application built with Python, Flask, PostgreSQL, WebSockets, Pandas & NumPy.

---

## 🚀 Features

- ✅ User Registration, Login & Logout
- ✅ Add, Update, Delete & View Tasks
- ✅ Task Priority (Low, Medium, High)
- ✅ Task Status (Pending, In Progress, Completed)
- ✅ Real-time updates using WebSockets
- ✅ Analytics dashboard powered by Pandas & NumPy
- ✅ Clean responsive UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| Database | PostgreSQL, SQLAlchemy |
| Real-time | Flask-SocketIO, WebSockets |
| Analytics | Pandas, NumPy |
| Frontend | HTML, CSS, JavaScript |

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/chinmayi-r-hegde/smart-task-manager.git
cd smart-task-manager
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup PostgreSQL
- Install PostgreSQL
- Open psql and run:
```bash
psql -U postgres
CREATE DATABASE task_manager_db;
\c task_manager_db
```
- Then run the schema:
```bash
psql -U postgres -d task_manager_db -f schema.sql
```

### 4. Configure environment
Create a `.env` file in the root folder:
SECRET_KEY=supersecretkey123
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/task_manager_db

### 5. Run the app
```bash
python run.py
```

### 6. Open in browser

http://localhost:5000

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| GET | /auth/logout | Logout user |
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create new task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/analytics | Get analytics data |

---

## 🔌 WebSocket Events

| Event | Description |
|-------|-------------|
| `task_added` | Fired when a new task is created |
| `task_updated` | Fired when a task is updated |
| `task_deleted` | Fired when a task is deleted |

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| username | VARCHAR(80) | Unique username |
| email | VARCHAR(120) | Unique email |
| password_hash | VARCHAR(256) | Hashed password |
| created_at | TIMESTAMP | Registration date |

### Tasks Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(200) | Task title |
| description | TEXT | Task description |
| priority | VARCHAR(20) | low, medium, high |
| status | VARCHAR(20) | pending, in_progress, completed |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |
| user_id | INTEGER | Foreign key to users |

---

## 📁 Project Structure
task_manager/
├── app/
│   ├── init.py        # App factory
│   ├── models.py          # Database models
│   ├── analytics.py       # Pandas & NumPy analytics
│   ├── sockets.py         # WebSocket events
│   └── routes/
│       ├── auth.py        # Authentication routes
│       └── tasks.py       # Task CRUD API routes
├── static/
│   ├── css/style.css      # Styling
│   └── js/socket.js       # WebSocket & API calls
├── templates/
│   ├── base.html          # Base template
│   ├── login.html         # Login page
│   ├── register.html      # Register page
│   └── dashboard.html     # Main dashboard
├── config.py              # Configuration
├── run.py                 # Entry point
├── schema.sql             # Database schema
├── requirements.txt       # Dependencies
└── README.md              # This file