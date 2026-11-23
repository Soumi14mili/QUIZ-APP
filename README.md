# CloudQuest — AWS Knowledge Arena

A competitive, timed quiz web application engineered for **100+ concurrent students** and instructors. Built with **Next.js 14 (App Router)** and powered natively by **Supabase** (PostgreSQL 17, Supabase Auth, Row-Level Security, and Postgres RPC functions).

Deployed on **Vercel** and **Supabase Cloud**.

---

## ⚡ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | Modern React 18 server and client components |
| **Styling & UI** | **Tailwind CSS** | Custom design system matching CloudQuest Figma spec |
| **Backend & Database** | **Supabase (PostgreSQL 17)** | Managed PostgreSQL with connection pooling via **Supavisor** |
| **Authentication** | **Supabase Auth (GoTrue)** | Secure email/password login, auto-verification emails, and session persistence |
| **Database Security** | **Row-Level Security (RLS)** | Granular database engine policies protecting student & admin data |
| **Server Logic** | **Postgres Stored Procedures (RPC)** | Atomic grading (`submit_quiz_attempt`), sanitized questions, and tiebreaker ranking |
| **Hosting & CI/CD** | **Vercel + GitHub** | Automatic zero-downtime edge deployments connected to Supabase |

---

## 📁 Project Structure

```
QUIZ-APP/
├── supabase/
│   └── migrations/
│       └── 20261123211500_cloudquest_init.sql  # Complete schema, RLS policies & RPC functions
│
├── frontend/
│   ├── .env.example                            # Template for Supabase environment variables
│   ├── .env.local                              # Local environment variables (gitignored)
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── lib/
│       │   └── supabase.js                     # Supabase client instantiation & helper methods
│       ├── context/
│       │   └── AuthContext.jsx                 # Supabase Auth state provider with real-time listener
│       ├── components/
│       │   ├── Navbar.jsx                      # Navigation header with role-aware links
│       │   ├── ProtectedRoute.jsx              # Client-side route guard (Student vs Admin)
│       │   ├── QuestionCard.jsx                # Interactive multiple-choice card
│       │   ├── ResultCard.jsx                  # Solution breakdown & answer key card
│       │   ├── SessionForm.jsx                 # Modal for creating and updating quiz sessions
│       │   ├── Timer.jsx                       # Quiz countdown clock
│       │   └── LoadingSpinner.jsx
│       └── app/
│           ├── layout.jsx                      # Global HTML root layout
│           ├── page.jsx                        # Landing page with Kawaii doodles, dot matrix & theme toggle
│           ├── login/page.jsx                  # Student sign-in
│           ├── register/page.jsx               # Student registration with email confirmation
│           ├── dashboard/page.jsx              # Student dashboard & live quiz join
│           ├── quiz/[sessionId]/page.jsx       # Timed quiz play arena
│           ├── results/[attemptId]/page.jsx    # Score summary and question breakdown
│           ├── leaderboard/[sessionId]/page.jsx# Live ranking podium & tiebreaker table
│           ├── admin/login/page.jsx            # Instructor portal sign-in
│           ├── admin/register/page.jsx         # Instructor setup protected by Admin Secret Key
│           ├── admin/dashboard/page.jsx        # Quiz session manager, live status toggle & CSV export
│           └── admin/sessions/[id]/questions/page.jsx # Question bank manager
│
├── backend/                                    # Legacy Express server (kept for fallback/reference)
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** ≥ 18.x
- **npm** or **pnpm**
- A free **Supabase** account ([supabase.com](https://supabase.com))

### 2. Configure Environment Variables
Inside the `frontend/` directory, create a `.env.local` file (or copy from `.env.example`):

```bash
cd frontend
cp .env.example .env.local
```

Fill in your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
NEXT_PUBLIC_ADMIN_SECRET_KEY=Admin@CloudQuest2026
```

### 3. Install Dependencies & Run Locally

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🛡️ Database & Business Logic (Supabase)

All database logic executes natively inside PostgreSQL via Stored Procedures (RPCs):

1. **`join_quiz_session(p_join_code)`**:
   - Validates that the session is active (`live`).
   - Creates or resumes the student's attempt with a server-side timestamp (`started_at = NOW()`).
   - Serves the question list sanitized **without** `correct_option` to prevent client-side inspection.

2. **`submit_quiz_attempt(p_attempt_id, p_answers)`**:
   - Locks the attempt for update (`FOR UPDATE`) to prevent double submissions.
   - Computes elapsed time in exact milliseconds strictly using server timestamps.
   - Performs atomic grading across all questions in a single multi-row `UNNEST` SQL query.
   - Updates score, total questions, and elapsed time in one transaction.

3. **`get_session_leaderboard(p_session_id)`**:
   - Ranks participants using the tiebreaker formula:
     $$\text{Rank} = \text{ROW\_NUMBER}() \text{ OVER } (\text{ORDER BY score DESC, time\_taken\_ms ASC, submitted\_at ASC})$$
   - Leverages the partial covering index `idx_attempts_leaderboard_tiebreaker` for sub-millisecond retrieval under 100+ concurrent requests.

4. **`get_attempt_result(p_attempt_id)`**:
   - Delivers the full question breakdown, user selections, and verified solutions after completion.

---

## 👑 Instructor & Admin Access

### Accessing the Admin Workspace
- Direct URL: **http://localhost:3000/admin/login**
- From the student login page: click **"Administrator? Use the admin portal"**.

### Registering an Instructor Account
1. **Via UI**: Visit `/admin/register`. Enter your name, email, password, and the **Admin Secret Key** (`Admin@CloudQuest2026` by default).
2. **Via Supabase SQL Editor**: Promote any registered user account instantly:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your_email@gmail.com';
   ```

---

## 🌐 Production Deployment (Vercel)

This application is optimized for **Vercel**:

1. Push your repository to **GitHub**.
2. Import the project into **Vercel**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
3. In **Settings $\rightarrow$ Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_SECRET_KEY`
4. Deploy! Vercel builds the static and dynamic pages with automatic edge CDN routing.

---

## 🎨 Theme & UI Highlights

- **Kawaii Cloud Doodles & Dot-Matrix Grid**: Inspired by the Figma Make CloudQuest design system.
- **Dark / Light Mode**: Floating theme switcher with seamless persistence and color adaptation across all hero cards, buttons, matrices, and footers.
- **Tiebreaker Podium**: Top 3 finishers receive Gold 🥇, Silver 🥈, and Bronze 🥉 podium cards with time callouts, followed by the comprehensive class rankings table.

---

## 💖 Credits

Made with ♡ by **Soumili & Swarnendu**

Licensed under the [MIT License](LICENSE).
