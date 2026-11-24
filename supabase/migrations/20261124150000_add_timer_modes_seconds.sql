-- ============================================================
-- Migration: Add Timer Mode & Duration in Seconds
-- ============================================================

-- 1. Alter quiz_sessions: add timer_mode and duration_seconds
ALTER TABLE public.quiz_sessions
    ADD COLUMN IF NOT EXISTS timer_mode VARCHAR(20) NOT NULL DEFAULT 'quiz'
        CHECK (timer_mode IN ('quiz', 'question')),
    ADD COLUMN IF NOT EXISTS duration_seconds INT NOT NULL DEFAULT 900
        CHECK (duration_seconds > 0);

-- Sync any existing records
UPDATE public.quiz_sessions
SET duration_seconds = COALESCE(duration_minutes * 60, 900)
WHERE duration_seconds IS NULL OR duration_seconds = 900;

-- 2. Alter questions: add time_limit_seconds
ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS time_limit_seconds INT NOT NULL DEFAULT 30
        CHECK (time_limit_seconds > 0);

-- 3. Update join_quiz_session RPC to return timer_mode, duration_seconds and question time_limit_seconds
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

    -- Return questions with time_limit_seconds but WITHOUT correct_option
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'session_id', q.session_id,
            'question_text', q.question_text,
            'option_a', q.option_a,
            'option_b', q.option_b,
            'option_c', q.option_c,
            'option_d', q.option_d,
            'time_limit_seconds', COALESCE(q.time_limit_seconds, 30),
            'sort_order', q.sort_order
        ) ORDER BY q.sort_order ASC, q.created_at ASC
    ) INTO v_questions FROM questions q WHERE q.session_id = v_session.id;

    RETURN jsonb_build_object(
        'session', jsonb_build_object(
            'id', v_session.id,
            'title', v_session.title,
            'description', v_session.description,
            'join_code', v_session.join_code,
            'duration_minutes', v_session.duration_minutes,
            'duration_seconds', COALESCE(v_session.duration_seconds, v_session.duration_minutes * 60, 900),
            'timer_mode', COALESCE(v_session.timer_mode, 'quiz')
        ),
        'attempt', to_jsonb(v_attempt),
        'questions', COALESCE(v_questions, '[]'::jsonb)
    );
END;
$$;

-- 4. Update submit_quiz_attempt RPC to respect duration_seconds & timer_mode
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
    p_attempt_id UUID,
    p_answers JSONB
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

    -- Calculate maximum duration in ms using duration_seconds
    IF v_session.duration_seconds IS NOT NULL AND v_session.duration_seconds > 0 THEN
        v_max_duration_ms := v_session.duration_seconds::bigint * 1000;
    ELSE
        v_max_duration_ms := v_session.duration_minutes::bigint * 60 * 1000;
    END IF;

    IF v_time_taken_ms > v_max_duration_ms THEN
        v_time_taken_ms := v_max_duration_ms;
    END IF;

    -- Bulk insert answers and calculate score
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
            (ra.sel = q.correct_option)
        FROM questions q
        LEFT JOIN raw_answers ra ON ra.q_id = q.id
        WHERE q.session_id = v_session.id
        ON CONFLICT (attempt_id, question_id) 
        DO UPDATE SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct
        RETURNING is_correct
    )
    SELECT COUNT(*) FILTER (WHERE is_correct = true) INTO v_score FROM inserted_answers;

    SELECT COUNT(*) INTO v_total_questions FROM questions WHERE session_id = v_session.id;

    -- Update attempt with final score, timestamp and duration
    UPDATE quiz_attempts
    SET 
        submitted_at = v_submitted_at,
        time_taken_ms = v_time_taken_ms,
        score = v_score,
        total_questions = v_total_questions,
        status = 'submitted'
    WHERE id = p_attempt_id;

    -- Return breakdown for immediate review
    SELECT jsonb_agg(
        jsonb_build_object(
            'question_id', q.id,
            'question_text', q.question_text,
            'option_a', q.option_a,
            'option_b', q.option_b,
            'option_c', q.option_c,
            'option_d', q.option_d,
            'correct_option', q.correct_option,
            'selected_option', a.selected_option,
            'is_correct', COALESCE(a.is_correct, false)
        ) ORDER BY q.sort_order ASC, q.created_at ASC
    ) INTO v_breakdown
    FROM questions q
    LEFT JOIN answers a ON a.question_id = q.id AND a.attempt_id = p_attempt_id
    WHERE q.session_id = v_session.id;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'session_id', v_session.id,
        'score', v_score,
        'total_questions', v_total_questions,
        'time_taken_ms', v_time_taken_ms,
        'breakdown', COALESCE(v_breakdown, '[]'::jsonb)
    );
END;
$$;
