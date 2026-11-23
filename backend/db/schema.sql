-- ============================================================
-- Quiz Application — PostgreSQL Schema
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Users (both admins and students)
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(255)     NOT NULL,
    email         VARCHAR(255)     NOT NULL UNIQUE,
    password_hash VARCHAR(255)     NOT NULL,
    role          VARCHAR(20)      NOT NULL DEFAULT 'student'
                      CHECK (role IN ('admin', 'student')),
    created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- ============================================================
-- 2. Quiz Sessions
-- ============================================================
CREATE TABLE quiz_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id        UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    join_code       VARCHAR(10)     NOT NULL UNIQUE,
    duration_minutes INT            NOT NULL CHECK (duration_minutes > 0),
    status          VARCHAR(10)     NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'live', 'ended')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_sessions_status    ON quiz_sessions (status);
CREATE INDEX idx_quiz_sessions_join_code ON quiz_sessions (join_code);
CREATE INDEX idx_quiz_sessions_admin     ON quiz_sessions (admin_id);

-- ============================================================
-- 3. Questions (belongs to a quiz session)
-- ============================================================
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID            NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_text   TEXT            NOT NULL,
    option_a        VARCHAR(500)    NOT NULL,
    option_b        VARCHAR(500)    NOT NULL,
    option_c        VARCHAR(500)    NOT NULL,
    option_d        VARCHAR(500)    NOT NULL,
    correct_option  CHAR(1)         NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_session ON questions (session_id, sort_order);

-- ============================================================
-- 4. Quiz Attempts (one per student per session)
-- ============================================================
CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID            NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    student_id      UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ,
    time_taken_ms   BIGINT,
    score           INT,
    total_questions INT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'submitted')),

    -- Prevent duplicate attempts: one attempt per student per session
    CONSTRAINT uq_attempt_session_student UNIQUE (session_id, student_id)
);

-- Leaderboard index: fast sorting by score DESC, time ASC
CREATE INDEX idx_attempts_leaderboard ON quiz_attempts (session_id, score DESC, time_taken_ms ASC);
CREATE INDEX idx_attempts_student     ON quiz_attempts (student_id);

-- ============================================================
-- 5. Answers (individual question responses)
-- ============================================================
CREATE TABLE answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID            NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id     UUID            NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option CHAR(1)         CHECK (selected_option IN ('A', 'B', 'C', 'D')),

    CONSTRAINT uq_answer_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_answers_attempt ON answers (attempt_id);
