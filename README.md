# 🚀 MeetCode

MeetCode is a real-time collaborative coding platform that allows developers to create or join coding rooms, write code together, communicate in real time, and collaborate efficiently.

The project is being built with a modern full-stack architecture using **FastAPI**, **PostgreSQL**, **Redis**, and **React**.

---

## ✨ Features

- 🔐 User Authentication (Signup/Login)
- 👤 JWT-based secure authentication
- 🏠 Create coding rooms
- 🔑 Join rooms using a unique room code
- 👑 Host and participant roles
- 💻 Real-time collaborative code editor *(In Progress)*
- ⚡ WebSocket-based communication *(Planned)*
- 🎥 Voice/Video collaboration *(Planned)*
- 💬 Live chat *(Planned)*
- 📝 Code execution support *(Planned)*
- 📜 Room history *(Planned)*

---

# 🛠 Tech Stack

## Backend

- Python
- FastAPI
- SQLAlchemy 2.0
- Alembic
- PostgreSQL
- Redis
- JWT Authentication
- Pydantic

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

---

# 📂 Project Structure

```
meetcode/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── websocket/
│   │   ├── config.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│
├── alembic/
│
├── tests/
│
└── README.md
```

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

# 📈 Roadmap

- [x] User Authentication
- [x] PostgreSQL Integration
- [x] Alembic Migrations
- [x] Room Creation Model
- [ ] Participant Management
- [ ] WebSocket Integration
- [ ] Collaborative Code Editor
- [ ] Live Chat
- [ ] Voice Chat
- [ ] Video Chat
- [ ] Code Execution
- [ ] Screen Sharing
- [ ] Deployment

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

## ⭐ If you like this project, consider giving it a star!