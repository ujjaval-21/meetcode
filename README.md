# 🚀 MeetCode

> A modern real-time collaborative coding platform inspired by VS Code Live Share, Replit Multiplayer, and Google Docs.

Build together. Code together. Learn together.

![Status](https://img.shields.io/badge/status-active-success)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Database](https://img.shields.io/badge/PostgreSQL-Database-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

MeetCode is a full-stack collaborative coding platform where multiple developers can join the same room and code together in real time.

It combines:

- ⚡ Live collaborative editing
- 🔐 Secure authentication
- 🏠 Coding rooms
- 👥 Real-time participant synchronization
- 💬 Team collaboration
- 🚀 Modern IDE experience

MeetCode is designed as a production-quality project showcasing modern full-stack development using React, FastAPI, PostgreSQL, WebSockets, and Monaco Editor.

---

# 📸 Screenshots

## Login

![Login](./assets/login.png)

## Dashboard

![Dashboard](./assets/dashboard.png)

## Collaborative Editor

![Editor](./assets/editor.png)

## Real-time Collaboration

![Realtime](./assets/realtime.png)

---

# ✨ Features

## ✅ Completed

- JWT Authentication
- Login / Signup
- Protected Routes
- Room Creation
- Join Room
- Leave Room
- Host & Participant Roles
- Real-time Room Participants
- Monaco Code Editor
- Language Selection
- Theme Support
- Live WebSocket Connection
- Real-time Collaborative Editing

---

## 🚧 Coming Soon

- Live Chat
- Voice Call
- Video Call
- Screen Sharing
- Whiteboard
- File Explorer
- Code Execution
- Cursor Presence
- Typing Indicators
- Room Recording
- Interview Mode

---

# 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| UI | Tailwind CSS |
| Editor | Monaco Editor |
| Backend | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Realtime | WebSockets |
| Migrations | Alembic |
| Future Cache | Redis |

---

# 📈 Current Progress

Authentication          ██████████ 100%

Room Management         ██████████ 100%

WebSocket               ██████████ 100%

Participants            ██████████ 100%

Collaborative Editor    ██████████ 100%

Chat                    ██░░░░░░░░ 20%

Voice                   ░░░░░░░░░░ 0%

Video                   ░░░░░░░░░░ 0%

Whiteboard              ░░░░░░░░░░ 0%

Docker                  ░░░░░░░░░░ 0%

---

# 📂 Project Structure

```
meetcode/
│
├── backend/
|   │
|   ├── api/
|   ├── core/
|   ├── db/
|   ├── middleware/
|   ├── models/
|   ├── schemas/
|   ├── services/
|   ├── utils/
|   ├── websocket/
|   └── main.py
│
├── frontend/
    │
    ├── components/
    ├── context/
    ├── hooks/
    ├── pages/
    ├── services/
    ├── routes/
    ├── store/
    ├── types/
    └── App.tsx

```

---

# 🏗 Architecture

```text
              Browser
                 │
        React + TypeScript
                 │
      Axios      │     WebSocket
          \      │      /
           \     │     /
            FastAPI Backend
                 │
         SQLAlchemy ORM
                 │
           PostgreSQL
```

---

# 🎯 Core Features

- Multi-user coding rooms
- Live collaborative editing
- Automatic participant synchronization
- JWT authentication
- Monaco Editor integration
- WebSocket communication
- Host and participant roles
- Responsive interface

---

## Roadmap

- [x] Authentication
- [x] JWT
- [x] PostgreSQL
- [x] Room System
- [x] WebSockets
- [x] Real-time Participants
- [x] Monaco Editor
- [x] Collaborative Editing

- [ ] Cursor Synchronization
- [ ] Live Chat
- [ ] Code Execution
- [ ] Voice Chat
- [ ] Video Chat
- [ ] Whiteboard
- [ ] File Explorer
- [ ] Docker
- [ ] Redis
- [ ] Kubernetes

---

## Why MeetCode?

MeetCode is being built as a production-quality collaborative development platform.

The project focuses on:

- Clean Architecture
- Real-time Communication
- Scalable Backend Design
- Modern React Development
- WebSocket Architecture
- Collaborative Editing
- System Design

---

## Future Vision

MeetCode aims to become an all-in-one collaborative development environment featuring:

- Collaborative IDE
- Online Compiler
- Pair Programming
- Technical Interview Platform
- Classroom Platform
- Team Workspace

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/ujjaval-21/meetcode.git

cd meetcode
```

---

## Create Virtual Environment

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

---

## Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file inside the project root.

Example:

```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/meetcode

REDIS_URL=redis://localhost:6379

SECRET_KEY=your-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Run Database Migrations

```bash
python -m alembic upgrade head
```

---

## Start Backend

```bash
python -m uvicorn app.main:app --reload
```

Backend:

```
http://127.0.0.1:8000
```

Swagger Docs:

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🗄 Database

Current tables:

- Users
- Rooms

Future tables:

- Participants
- Messages
- Room History

---

# 🔒 Authentication

MeetCode uses:

- JWT Access Tokens
- Password Hashing
- Protected Routes

---

# 🧪 Testing

```bash
pytest
```

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 👨‍💻 Author

**Ujjaval Yadav**

GitHub: https://github.com/ujjaval-21

---

---

⭐ If you found this project interesting, consider giving it a star.

Made with ❤️ using React, FastAPI and PostgreSQL.