# CloudQuest — Quiz Web Application

A full-stack, multi-session quiz platform built for 100+ concurrent users. Features dual authentication (Admin / Student), server-side timer enforcement, real-time leaderboards with time-based tie-breaking, and CSV exports.

## Tech Stack

| Layer        | Technology                                   |
|:-------------|:---------------------------------------------|
| Frontend     | Next.js 14 (App Router) + Tailwind CSS       |
| Backend      | Node.js + Express.js                         |
| Database     | PostgreSQL (with connection pooling & indexing)|
| Auth         | JWT (Bearer tokens) + bcrypt password hashing |

---

## Project Structure

```
QUIZ APP/
├── backend/
│   ├── server.js              # Express entry point
│   ├── package.json
│   ├── .env.example           # Environment variable template
│   ├── db/
│   │   ├── schema.sql         # Complete PostgreSQL schema
│   │   ├── pool.js            # Connection pool (max 20)
│   │   └── init.js            # Schema initializer script
│   ├── middleware/
│   │   └── auth.js            # JWT + role-based middleware
│   ├── routes/
│   │   ├── auth.js            # Register, Login, Admin Login, /me
│   │   ├── admin.js           # Session CRUD, Questions, Monitoring, CSV Export
│   │   ├── quiz.js            # Student: list sessions, join, submit, get results
│   │   └── leaderboard.js     # Public leaderboard by session
│   └── utils/
│       └── seed.js            # Admin account seeder
│
├── frontend/
│   ├── next.config.js         # API proxy to backend
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── index.css           # Tailwind directives + custom styles
│       ├── api/axios.js        # Axios instance with auth interceptors
│       ├── context/AuthContext.jsx  # Auth state provider
│       ├── components/         # Navbar, Timer, QuestionCard, ResultCard, etc.
│       └── app/                # Next.js App Router pages
│           ├── page.jsx                           # Landing page
│           ├── layout.jsx                         # Root layout + providers
│           ├── login/page.jsx                     # Student login
│           ├── register/page.jsx                  # Student registration
│           ├── admin/login/page.jsx               # Admin login
│           ├── admin/dashboard/page.jsx           # Admin session manager
│           ├── admin/sessions/[id]/questions/page.jsx  # Question manager
│           ├── dashboard/page.jsx                 # Student dashboard
│           ├── quiz/[sessionId]/page.jsx          # Live quiz play
│           ├── results/[attemptId]/page.jsx       # Post-submission review
│           └── leaderboard/[sessionId]/page.jsx   # Ranked leaderboard
│
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 (local install, Docker, or cloud: Supabase / Neon / Railway)
- **npm** (comes with Node.js)

---

## Setup Instructions

### 1. Clone & Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL credentials:

```env
# ---- Database ----
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/quizapp

# ---- JWT ----
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=24h

# ---- Admin Seed ----
ADMIN_EMAIL=admin@quizapp.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Quiz Master

# ---- Server ----
PORT=5000
NODE_ENV=development

# ---- Frontend URL (for CORS) ----
FRONTEND_URL=http://localhost:3000
```

### 2. Create the PostgreSQL Database

```bash
# Using psql:
psql -U postgres -c "CREATE DATABASE quizapp;"
```

### 3. Install Backend Dependencies & Initialize

```bash
cd backend
npm install

# Apply the database schema
npm run db:init

# Seed the initial admin account
npm run seed
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 5. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → Runs on http://localhost:3000
```

The frontend proxies all `/api/*` requests to `http://localhost:5000` automatically via `next.config.js`.

---

## Default Admin Credentials

| Field    | Value                   |
|:---------|:------------------------|
| Email    | `admin@quizapp.com`     |
| Password | `Admin@123456`          |

Access the admin login at: **http://localhost:3000/admin/login**

---

## API Endpoints Summary

### Auth (`/api/auth`)
| Method | Endpoint       | Description              | Auth Required |
|:-------|:---------------|:-------------------------|:--------------|
| POST   | `/register`    | Student registration     | No            |
| POST   | `/login`       | Student login            | No            |
| POST   | `/admin/login` | Admin login              | No            |
| GET    | `/me`          | Current user info        | Yes           |

### Admin (`/api/admin`) — Admin only
| Method | Endpoint                        | Description                 |
|:-------|:--------------------------------|:----------------------------|
| POST   | `/sessions`                     | Create quiz session         |
| GET    | `/sessions`                     | List all admin sessions     |
| GET    | `/sessions/:id`                 | Session details             |
| PUT    | `/sessions/:id`                 | Update session              |
| DELETE | `/sessions/:id`                 | Delete session (cascades)   |
| POST   | `/sessions/:id/questions`       | Add question                |
| GET    | `/sessions/:id/questions`       | List questions              |
| PUT    | `/questions/:id`                | Update question             |
| DELETE | `/questions/:id`                | Delete question             |
| GET    | `/sessions/:id/participants`    | List participants           |
| GET    | `/sessions/:id/leaderboard`     | Admin leaderboard view      |
| GET    | `/sessions/:id/export`          | Export results as CSV       |

### Quiz (`/api/quiz`) — Student only
| Method | Endpoint                       | Description                  |
|:-------|:-------------------------------|:-----------------------------|
| GET    | `/sessions`                    | List live sessions           |
| POST   | `/sessions/join`               | Join session by join code    |
| GET    | `/attempts/:id`                | Get submitted attempt result |
| POST   | `/attempts/:id/submit`         | Submit quiz answers          |

### Leaderboard (`/api/leaderboard`) — Any authenticated user
| Method | Endpoint         | Description                |
|:-------|:-----------------|:---------------------------|
| GET    | `/sessions/:id`  | Ranked leaderboard         |

---

## Key Features

### Security & Integrity
- ✅ Passwords hashed with **bcrypt** (12 rounds)
- ✅ **JWT** tokens with configurable expiration
- ✅ Correct answers **never sent to frontend** during quiz
- ✅ All grading performed **server-side** on submission
- ✅ Server-side `started_at` and `submitted_at` timestamps
- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Helmet, CORS, and rate limiting middleware

### Concurrency (100+ Users)
- ✅ **UNIQUE constraint** on `(session_id, student_id)` prevents duplicate attempts
- ✅ **UNIQUE constraint** on `(attempt_id, question_id)` prevents duplicate answers
- ✅ **Database indexes** on leaderboard sort columns `(session_id, score DESC, time_taken_ms ASC)`
- ✅ **Connection pool** with 20 max connections
- ✅ Transaction-based submission with `BEGIN / COMMIT / ROLLBACK`
- ✅ Upsert (`ON CONFLICT`) for idempotent answer insertion

### Leaderboard Sorting
1. **Primary**: Score descending (highest first)
2. **Tie-breaker**: Time taken ascending (fastest first)

### Timer Enforcement
- Server records `started_at` on join
- Client countdown derived from `server_started_at` + `duration_minutes`
- Auto-submit on timer expiry
- Time capped at max duration (never rejected for overtime)

---

## Deployment

### Production Build (Frontend)

```bash
cd frontend
npm run build
npm start
# → Serves production Next.js on port 3000
```

### Production (Backend)

```bash
cd backend
NODE_ENV=production node server.js
```

### Docker / Cloud Deployment

For PostgreSQL, use managed services:
- **Supabase**: `DATABASE_URL=postgresql://...@db.xxx.supabase.co:5432/postgres`
- **Neon**: `DATABASE_URL=postgresql://...@ep-xxx.us-east-2.aws.neon.tech/quizapp`
- **Railway**: Auto-provisioned `DATABASE_URL`

Deploy the backend and frontend as separate services (e.g., Railway, Render, Fly.io), or combine with Docker Compose.

Set `FRONTEND_URL` on the backend to your deployed frontend domain for CORS.

---

## License

MIT
