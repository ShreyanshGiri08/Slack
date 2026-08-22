# Mini Slack — Real-Time Team Messaging App

A production-grade, highly architecture-focused real-time team messaging web application built with **React**, **FastAPI**, and **Neon PostgreSQL**.

---

## 🚀 Key Features

1. **Workspace & Channels**: Default channels (`#general`, `#engineering`, `#random`, `#design`).
2. **Channel Switching & Animations**: Smooth tab switching powered by Framer Motion.
3. **Real-time Messaging**: Native FastAPI WebSockets broadcast live messages, deletions, and emoji reactions without polling.
4. **Soft Deletion**: Messages are soft-deleted (`is_deleted=True`) to maintain thread continuity.
5. **Emoji Reactions & Picker**: Integrated `emoji-picker-react` with aggregated reaction pills.
6. **Threaded Message Replies**: Sliding side drawer for focused conversation threads.
7. **Unread Message Badges**: `message_reads` tracking updates live per channel.
8. **Workspace Text Search**: Search messages across workspace or specific channels.
9. **Dark & Light Mode**: Seamless theme toggling with custom Tailwind HSL tokens.
10. **DiceBear Avatar API**: Auto-generated user avatars based on usernames.

---

## 🛠️ Architecture Decisions

### Backend (FastAPI + SQLAlchemy + Pydantic v2 + WebSockets)
- **Separation of Concerns**:
  - `app/models/`: SQLAlchemy ORM definitions with database constraints.
  - `app/schemas/`: Pydantic input validation and response serialization.
  - `app/services/`: Pure business logic and database queries.
  - `app/routers/`: Clean REST route handlers free of business logic.
  - `app/websocket/`: Isolated WebSocket connection manager.
- **Heavy Documentation**: Every module, model, service, and router contains Python docstrings explaining *WHAT* it does and *WHY* it is structured as such.

### Frontend (React + Tailwind CSS + Framer Motion)
- **State & Real-time**: `AuthContext` handles theme modes, user sessions, active channels, and global WebSocket connection listeners.
- **Micro-Animations**: Framer Motion handles channel sliding transitions, reaction popovers, and thread drawer pop-ins.

---

## 💻 How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000` (OpenAPI Docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will be running at `http://localhost:3000`.

---

## ⚡ Database Connection
Neon PostgreSQL Connection URL configured in `backend/.env`:
`postgresql://neondb_owner:npg_kXM4nOZI9mKp@ep-misty-bread-axw5g972-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require`
