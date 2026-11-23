-- ============================================================
-- CloudQuest — Supabase Migration
-- Features: Profiles with Auth Trigger, RLS, RPCs for Timed Sessions & Tiebreakers
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Profiles Table (Linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name  VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'student'
                   CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Function & Trigger: Automatically create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. Quiz Sessions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id         UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title            VARCHAR(255)    NOT NULL,
    description      TEXT,
    join_code        VARCHAR(10)     NOT NULL UNIQUE,
    duration_minutes INT             NOT NULL CHECK (duration_minutes > 0),
    status           VARCHAR(10)     NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft', 'live', 'ended')),
    starts_at        TIMESTAMPTZ,
    ends_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status    ON public.quiz_sessions (status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_join_code ON public.quiz_sessions (join_code);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_admin     ON public.quiz_sessions (admin_id);

-- ============================================================
-- 3. Questions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id     UUID            NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_text  TEXT            NOT NULL,
    option_a       VARCHAR(500)    NOT NULL,
    option_b       VARCHAR(500)    NOT NULL,
    option_c       VARCHAR(500)    NOT NULL,
    option_d       VARCHAR(500)    NOT NULL,
    correct_option CHAR(1)         NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    sort_order     INT             NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_session ON public.questions (session_id, sort_order ASC);

-- ============================================================
-- 4. Quiz Attempts Table (Millisecond Precision)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID            NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    student_id      UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ(3)  NOT NULL DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ(3),
    time_taken_ms   BIGINT,                                 -- Exact elapsed time
    score           INT             NOT NULL DEFAULT 0,
    total_questions INT             NOT NULL DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'submitted', 'timed_out')),
    CONSTRAINT uq_attempt_session_student UNIQUE (session_id, student_id)
);

-- Tiebreaker index: Score DESC, time_taken_ms ASC, submitted_at ASC
CREATE INDEX IF NOT EXISTS idx_attempts_leaderboard_tiebreaker 
    ON public.quiz_attempts (session_id, score DESC, time_taken_ms ASC, submitted_at ASC)
    WHERE status = 'submitted';

CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.quiz_attempts (student_id);

-- ============================================================
-- 5. Answers Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID            NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id     UUID            NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option CHAR(1)         CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct      BOOLEAN,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_answer_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.answers (attempt_id);

-- ============================================================
-- 6. Row-Level Security (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Authenticated users can read profiles, update only their own
DROP POLICY IF EXISTS "Profiles readable by users" ON public.profiles;
CREATE POLICY "Profiles readable by users" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Quiz Sessions: Students see 'live' / 'ended' sessions; Admins manage all
DROP POLICY IF EXISTS "Students view live or ended sessions" ON public.quiz_sessions;
CREATE POLICY "Students view live or ended sessions" ON public.quiz_sessions 
    FOR SELECT TO authenticated USING (status IN ('live', 'ended') OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage sessions" ON public.quiz_sessions;
CREATE POLICY "Admins manage sessions" ON public.quiz_sessions 
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Questions: Only admins have direct query access
-- (Students fetch sanitized questions without correct_option via the join_quiz_session RPC)
DROP POLICY IF EXISTS "Admins manage questions" ON public.questions;
CREATE POLICY "Admins manage questions" ON public.questions 
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Attempts: Students view only their own attempt; Admins view all
DROP POLICY IF EXISTS "Read own attempts or Admin all" ON public.quiz_attempts;
CREATE POLICY "Read own attempts or Admin all" ON public.quiz_attempts 
    FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());

-- ============================================================
-- 7. RPC Functions
-- ============================================================

-- RPC 1: Join Session & Fetch Sanitized Questions
CREATE OR REPLACE FUNCTION public.join_quiz_session(p_join_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session RECORD;
    v_attempt RECORD;
    v_questions JSONB;
BEGIN
    SELECT * INTO v_session FROM quiz_sessions WHERE join_code = UPPER(TRIM(p_join_code));
    IF NOT FOUND THEN RAISE EXCEPTION 'Quiz session not found with code %', p_join_code; END IF;
    IF v_session.status <> 'live' THEN RAISE EXCEPTION 'Quiz session is not currently live'; END IF;

    SELECT * INTO v_attempt FROM quiz_attempts WHERE session_id = v_session.id AND student_id = auth.uid();
    IF FOUND THEN
        IF v_attempt.status = 'submitted' THEN
            RAISE EXCEPTION 'You have already submitted an attempt for this quiz session.';
        END IF;
    ELSE
        INSERT INTO quiz_attempts (session_id, student_id, started_at, status)
        VALUES (v_session.id, auth.uid(), NOW(), 'in_progress')
        RETURNING * INTO v_attempt;
    END IF;

    -- Return questions without correct_option to prevent client-side inspection
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'session_id', q.session_id,
            'question_text', q.question_text,
            'option_a', q.option_a,
            'option_b', q.option_b,
            'option_c', q.option_c,
            'option_d', q.option_d,
            'sort_order', q.sort_order
        ) ORDER BY q.sort_order ASC, q.created_at ASC
    ) INTO v_questions FROM questions q WHERE q.session_id = v_session.id;

    RETURN jsonb_build_object(
        'session', jsonb_build_object(
            'id', v_session.id,
            'title', v_session.title,
            'description', v_session.description,
            'join_code', v_session.join_code,
            'duration_minutes', v_session.duration_minutes
        ),
        'attempt', to_jsonb(v_attempt),
        'questions', COALESCE(v_questions, '[]'::jsonb)
    );
END;
$$;

-- RPC 2: Submit Quiz Attempt & Single-Query Grading
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
    p_attempt_id UUID,
    p_answers JSONB -- Array of { "question_id": "...", "selected_option": "A" }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt RECORD;
    v_session RECORD;
    v_time_taken_ms BIGINT;
    v_max_duration_ms BIGINT;
    v_score INT := 0;
    v_total_questions INT;
    v_breakdown JSONB;
    v_submitted_at TIMESTAMPTZ := NOW();
BEGIN
    SELECT * INTO v_attempt FROM quiz_attempts WHERE id = p_attempt_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Attempt not found'; END IF;
    IF v_attempt.student_id <> auth.uid() THEN RAISE EXCEPTION 'Unauthorized submission'; END IF;
    IF v_attempt.status <> 'in_progress' THEN RAISE EXCEPTION 'Attempt has already been submitted'; END IF;

    SELECT * INTO v_session FROM quiz_sessions WHERE id = v_attempt.session_id;

    -- Compute millisecond time taken from server clock
    v_time_taken_ms := (EXTRACT(EPOCH FROM (v_submitted_at - v_attempt.started_at)) * 1000)::bigint;
    IF v_time_taken_ms < 0 THEN v_time_taken_ms := 0; END IF;

    v_max_duration_ms := v_session.duration_minutes * 60 * 1000;
    IF v_time_taken_ms > v_max_duration_ms THEN
        v_time_taken_ms := v_max_duration_ms;
    END IF;

    -- Bulk insert answers and calculate score in one statement
    WITH raw_answers AS (
        SELECT 
            (elem->>'question_id')::uuid AS q_id, 
            UPPER(TRIM(elem->>'selected_option')) AS sel
        FROM jsonb_array_elements(p_answers) elem
    ),
    inserted_answers AS (
        INSERT INTO answers (attempt_id, question_id, selected_option, is_correct)
        SELECT 
            p_attempt_id,
            q.id,
            ra.sel,
            (ra.sel IS NOT NULL AND ra.sel = q.correct_option)
        FROM questions q
        LEFT JOIN raw_answers ra ON q.id = ra.q_id
        WHERE q.session_id = v_session.id
        ON CONFLICT (attempt_id, question_id) 
        DO UPDATE SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct
        RETURNING *
    )
    SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct = true)
    INTO v_total_questions, v_score FROM inserted_answers;

    UPDATE quiz_attempts
    SET 
        submitted_at = v_submitted_at,
        time_taken_ms = v_time_taken_ms,
        score = v_score,
        total_questions = v_total_questions,
        status = 'submitted'
    WHERE id = p_attempt_id;

    -- Build result breakdown
    SELECT jsonb_agg(
        jsonb_build_object(
            'question_id', q.id,
            'question_text', q.question_text,
            'option_a', q.option_a,
            'option_b', q.option_b,
            'option_c', q.option_c,
            'option_d', q.option_d,
            'selected_option', a.selected_option,
            'correct_option', q.correct_option,
            'is_correct', COALESCE(a.is_correct, false)
        ) ORDER BY q.sort_order ASC
    ) INTO v_breakdown
    FROM questions q
    LEFT JOIN answers a ON a.attempt_id = p_attempt_id AND a.question_id = q.id
    WHERE q.session_id = v_session.id;

    RETURN jsonb_build_object(
        'message', 'Quiz submitted successfully',
        'score', v_score,
        'total_questions', v_total_questions,
        'time_taken_ms', v_time_taken_ms,
        'breakdown', v_breakdown
    );
END;
$$;

-- RPC 3: Get Leaderboard with Tiebreaker
CREATE OR REPLACE FUNCTION public.get_session_leaderboard(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session RECORD;
    v_leaderboard JSONB;
BEGIN
    SELECT * INTO v_session FROM quiz_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Quiz session not found'; END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'rank', r.rank,
            'student_name', r.full_name,
            'user_id', r.student_id,
            'score', r.score,
            'total_questions', r.total_questions,
            'time_taken_ms', r.time_taken_ms
        )
    ) INTO v_leaderboard
    FROM (
        SELECT 
            ROW_NUMBER() OVER (
                ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC
            )::int AS rank,
            qa.student_id,
            p.full_name,
            qa.score,
            qa.total_questions,
            qa.time_taken_ms
        FROM quiz_attempts qa
        JOIN profiles p ON qa.student_id = p.id
        WHERE qa.session_id = p_session_id AND qa.status = 'submitted'
        ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC
    ) r;

    RETURN jsonb_build_object(
        'session_id', v_session.id,
        'session_title', v_session.title,
        'session_status', v_session.status,
        'leaderboard', COALESCE(v_leaderboard, '[]'::jsonb)
    );
END;
$$;

-- RPC 4: Get Attempt Result (for /results/[attemptId] page)
CREATE OR REPLACE FUNCTION public.get_attempt_result(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt RECORD;
    v_breakdown JSONB;
BEGIN
    SELECT qa.*, qs.title as session_title
    INTO v_attempt
    FROM quiz_attempts qa
    JOIN quiz_sessions qs ON qa.session_id = qs.id
    WHERE qa.id = p_attempt_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'Attempt not found'; END IF;
    IF v_attempt.student_id <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'question_id', q.id,
            'question_text', q.question_text,
            'option_a', q.option_a,
            'option_b', q.option_b,
            'option_c', q.option_c,
            'option_d', q.option_d,
            'selected_option', a.selected_option,
            'correct_option', q.correct_option,
            'is_correct', COALESCE(a.is_correct, false)
        ) ORDER BY q.sort_order ASC
    ) INTO v_breakdown
    FROM questions q
    LEFT JOIN answers a ON a.attempt_id = p_attempt_id AND a.question_id = q.id
    WHERE q.session_id = v_attempt.session_id;

    RETURN jsonb_build_object(
        'id', v_attempt.id,
        'session_id', v_attempt.session_id,
        'session_title', v_attempt.session_title,
        'score', v_attempt.score,
        'total_questions', v_attempt.total_questions,
        'time_taken_ms', v_attempt.time_taken_ms,
        'status', v_attempt.status,
        'breakdown', COALESCE(v_breakdown, '[]'::jsonb)
    );
END;
$$;

