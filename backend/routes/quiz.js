const express = require('express');
const pool = require('../db/pool');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// All routes require authenticateToken + requireStudent
router.use(authenticateToken, requireStudent);

// GET /sessions — list all 'live' sessions
router.get('/sessions', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
         qs.id,
         qs.title,
         qs.description,
         qs.join_code,
         qs.duration_minutes,
         qs.duration_seconds,
         qs.timer_mode,
         qs.created_at,
         COUNT(q.id)::int AS question_count
       FROM quiz_sessions qs
       LEFT JOIN questions q ON q.session_id = qs.id
       WHERE qs.status = 'live'
       GROUP BY qs.id
       ORDER BY qs.created_at DESC`
    );

    return res.json({ sessions: result.rows });
  } catch (error) {
    return next(error);
  }
});

// POST /sessions/join — join a session by join_code
router.post('/sessions/join', async (req, res, next) => {
  try {
    const { join_code } = req.body;

    if (!join_code || typeof join_code !== 'string' || !join_code.trim()) {
      return res.status(400).json({ error: 'join_code is required' });
    }

    const code = join_code.trim().toUpperCase();

    // Check if session exists and is live
    const sessionResult = await pool.query(
      `SELECT id, title, description, join_code, duration_minutes, duration_seconds, timer_mode, status
       FROM quiz_sessions
       WHERE join_code = $1`,
      [code]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found with the provided join code' });
    }

    const session = sessionResult.rows[0];

    if (session.status !== 'live') {
      return res.status(400).json({
        error: `Cannot join quiz session. The session is currently ${session.status}.`,
      });
    }

    // Check if student already has an attempt
    const attemptResult = await pool.query(
      `SELECT id, session_id, student_id, started_at, submitted_at, time_taken_ms, score, total_questions, status
       FROM quiz_attempts
       WHERE session_id = $1 AND student_id = $2`,
      [session.id, req.user.id]
    );

    let attempt;
    if (attemptResult.rows.length > 0) {
      attempt = attemptResult.rows[0];
      if (attempt.status === 'submitted') {
        return res.status(400).json({
          error: 'You have already submitted an attempt for this quiz session.',
        });
      }
    } else {
      // Create new quiz_attempt
      const newAttemptResult = await pool.query(
        `INSERT INTO quiz_attempts (session_id, student_id, started_at, status)
         VALUES ($1, $2, NOW(), 'in_progress')
         RETURNING id, session_id, student_id, started_at, submitted_at, time_taken_ms, score, total_questions, status`,
        [session.id, req.user.id]
      );
      attempt = newAttemptResult.rows[0];
    }

    // Fetch questions WITHOUT correct_option
    const questionsResult = await pool.query(
      `SELECT id, session_id, question_text, option_a, option_b, option_c, option_d, time_limit_seconds, sort_order
       FROM questions
       WHERE session_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [session.id]
    );

    return res.json({
      message: attemptResult.rows.length > 0 ? 'Resumed quiz attempt' : 'Joined quiz session successfully',
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        join_code: session.join_code,
        duration_minutes: session.duration_minutes,
        duration_seconds: session.duration_seconds || session.duration_minutes * 60,
        timer_mode: session.timer_mode || 'quiz',
      },
      attempt,
      questions: questionsResult.rows,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /attempts/:attemptId — get attempt result (after submission)
router.get('/attempts/:attemptId', async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const attemptQuery = await pool.query(
      `SELECT qa.id, qa.session_id, qa.student_id, qa.started_at, qa.submitted_at,
              qa.time_taken_ms, qa.score, qa.total_questions, qa.status
       FROM quiz_attempts qa
       WHERE qa.id = $1 AND qa.student_id = $2`,
      [attemptId, req.user.id]
    );

    if (attemptQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    const attempt = attemptQuery.rows[0];

    if (attempt.status !== 'submitted') {
      return res.status(400).json({ error: 'Quiz attempt has not been submitted yet' });
    }

    // Fetch questions with correct answers and student's answers
    const breakdownQuery = await pool.query(
      `SELECT q.id AS question_id, q.question_text, q.option_a, q.option_b,
              q.option_c, q.option_d, q.correct_option, a.selected_option,
              (a.selected_option = q.correct_option) AS is_correct
       FROM questions q
       LEFT JOIN answers a ON a.question_id = q.id AND a.attempt_id = $1
       WHERE q.session_id = $2
       ORDER BY q.sort_order ASC, q.created_at ASC`,
      [attemptId, attempt.session_id]
    );

    return res.json({
      attempt: {
        ...attempt,
        breakdown: breakdownQuery.rows,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// POST /attempts/:attemptId/submit — submit answers
router.post('/attempts/:attemptId/submit', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    // Fetch attempt with session duration
    const attemptQuery = await client.query(
      `SELECT qa.id, qa.session_id, qa.student_id, qa.started_at, qa.submitted_at, qa.status, qs.duration_minutes, qs.duration_seconds, qs.timer_mode
       FROM quiz_attempts qa
       JOIN quiz_sessions qs ON qa.session_id = qs.id
       WHERE qa.id = $1`,
      [attemptId]
    );

    if (attemptQuery.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    const attempt = attemptQuery.rows[0];

    // Validate ownership
    if (attempt.student_id !== req.user.id) {
      client.release();
      return res.status(403).json({ error: 'You are not authorized to submit this attempt' });
    }

    // Validate status is in_progress
    if (attempt.status !== 'in_progress') {
      client.release();
      return res.status(400).json({ error: 'This quiz attempt has already been submitted' });
    }

    const submittedAt = new Date();
    const startedAt = new Date(attempt.started_at);
    let timeTakenMs = submittedAt.getTime() - startedAt.getTime();
    if (timeTakenMs < 0) {
      timeTakenMs = 0;
    }

    // Cap the time if it exceeded session duration (do not reject)
    const effectiveDurationSeconds = attempt.duration_seconds || (attempt.duration_minutes * 60);
    const maxDurationMs = effectiveDurationSeconds * 1000;
    if (timeTakenMs > maxDurationMs) {
      timeTakenMs = maxDurationMs;
    }

    // Fetch questions with correct_option for grading
    const questionsResult = await client.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order
       FROM questions
       WHERE session_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [attempt.session_id]
    );

    const questions = questionsResult.rows;

    // Map submitted answers: { question_id: selected_option }
    const answerMap = {};
    if (Array.isArray(answers)) {
      for (const item of answers) {
        if (item && item.question_id) {
          answerMap[item.question_id] = item.selected_option;
        }
      }
    }

    let score = 0;
    const breakdown = [];
    const answersToInsert = [];

    for (const q of questions) {
      const rawSelected = answerMap[q.id];
      const selected = rawSelected ? rawSelected.toString().trim().toUpperCase() : null;
      const validSelected = ['A', 'B', 'C', 'D'].includes(selected) ? selected : null;
      const isCorrect = validSelected !== null && validSelected === q.correct_option;

      if (isCorrect) {
        score++;
      }

      if (validSelected !== null) {
        answersToInsert.push({
          questionId: q.id,
          selectedOption: validSelected,
        });
      }

      breakdown.push({
        question_id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        selected_option: validSelected,
        correct_option: q.correct_option,
        is_correct: isCorrect,
      });
    }

    await client.query('BEGIN');

    // Update quiz_attempt
    await client.query(
      `UPDATE quiz_attempts
       SET 
         submitted_at = $1,
         time_taken_ms = $2,
         score = $3,
         total_questions = $4,
         status = 'submitted'
       WHERE id = $5`,
      [submittedAt.toISOString(), timeTakenMs, score, questions.length, attempt.id]
    );

    // Insert answers
    for (const ans of answersToInsert) {
      await client.query(
        `INSERT INTO answers (attempt_id, question_id, selected_option)
         VALUES ($1, $2, $3)
         ON CONFLICT (attempt_id, question_id)
         DO UPDATE SET selected_option = EXCLUDED.selected_option`,
        [attempt.id, ans.questionId, ans.selectedOption]
      );
    }

    await client.query('COMMIT');
    client.release();

    return res.json({
      message: 'Quiz submitted successfully',
      score,
      total_questions: questions.length,
      time_taken_ms: timeTakenMs,
      breakdown,
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    return next(error);
  }
});

module.exports = router;
