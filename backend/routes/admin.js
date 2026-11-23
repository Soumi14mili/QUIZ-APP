const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authenticateToken + requireAdmin
router.use(authenticateToken, requireAdmin);

// Helper to generate a unique 6-char uppercase alphanumeric join code
async function generateUniqueJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding ambiguous chars like 0, O, 1, I
  let attempts = 0;
  while (attempts < 10) {
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }

    const check = await pool.query('SELECT id FROM quiz_sessions WHERE join_code = $1', [code]);
    if (check.rows.length === 0) {
      return code;
    }
    attempts++;
  }
  // Fallback to random hex uppercase if high collisions
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// -------------------------------------------------------------
// SESSIONS
// -------------------------------------------------------------

// POST /sessions — create quiz session
router.post('/sessions', async (req, res, next) => {
  try {
    const { title, description, duration_minutes } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Session title is required' });
    }

    const duration = parseInt(duration_minutes, 10);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: 'duration_minutes must be a positive integer' });
    }

    const joinCode = await generateUniqueJoinCode();

    const result = await pool.query(
      `INSERT INTO quiz_sessions (admin_id, title, description, join_code, duration_minutes, status)
       VALUES ($1, $2, $3, $4, $5, 'draft')
       RETURNING id, admin_id, title, description, join_code, duration_minutes, status, created_at, updated_at`,
      [req.user.id, title.trim(), description ? description.trim() : null, joinCode, duration]
    );

    return res.status(201).json({
      message: 'Quiz session created successfully',
      session: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
});

// GET /sessions — list all sessions created by this admin
router.get('/sessions', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
         qs.id,
         qs.admin_id,
         qs.title,
         qs.description,
         qs.join_code,
         qs.duration_minutes,
         qs.status,
         qs.created_at,
         qs.updated_at,
         COUNT(DISTINCT q.id)::int AS question_count,
         COUNT(DISTINCT qa.id)::int AS participant_count
       FROM quiz_sessions qs
       LEFT JOIN questions q ON q.session_id = qs.id
       LEFT JOIN quiz_attempts qa ON qa.session_id = qs.id
       WHERE qs.admin_id = $1
       GROUP BY qs.id
       ORDER BY qs.created_at DESC`,
      [req.user.id]
    );

    return res.json({ sessions: result.rows });
  } catch (error) {
    return next(error);
  }
});

// GET /sessions/:id — get session details with question & participant count
router.get('/sessions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         qs.id,
         qs.admin_id,
         qs.title,
         qs.description,
         qs.join_code,
         qs.duration_minutes,
         qs.status,
         qs.created_at,
         qs.updated_at,
         COUNT(DISTINCT q.id)::int AS question_count,
         COUNT(DISTINCT qa.id)::int AS participant_count
       FROM quiz_sessions qs
       LEFT JOIN questions q ON q.session_id = qs.id
       LEFT JOIN quiz_attempts qa ON qa.session_id = qs.id
       WHERE qs.id = $1 AND qs.admin_id = $2
       GROUP BY qs.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    return res.json({ session: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

// PUT /sessions/:id — update session
router.put('/sessions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, duration_minutes, status } = req.body;

    // Check ownership
    const existing = await pool.query(
      'SELECT id FROM quiz_sessions WHERE id = $1 AND admin_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    let parsedDuration = null;
    if (duration_minutes !== undefined) {
      parsedDuration = parseInt(duration_minutes, 10);
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        return res.status(400).json({ error: 'duration_minutes must be a positive integer' });
      }
    }

    if (status !== undefined) {
      if (!['draft', 'live', 'ended'].includes(status)) {
        return res.status(400).json({ error: 'status must be draft, live, or ended' });
      }
    }

    const result = await pool.query(
      `UPDATE quiz_sessions
       SET 
         title = COALESCE($1, title),
         description = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE description END,
         duration_minutes = COALESCE($3, duration_minutes),
         status = COALESCE($4, status),
         updated_at = NOW()
       WHERE id = $5 AND admin_id = $6
       RETURNING id, admin_id, title, description, join_code, duration_minutes, status, created_at, updated_at`,
      [
        title ? title.trim() : null,
        description !== undefined ? description : null,
        parsedDuration,
        status || null,
        id,
        req.user.id,
      ]
    );

    return res.json({
      message: 'Quiz session updated successfully',
      session: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /sessions/:id — delete session (cascades)
router.delete('/sessions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM quiz_sessions WHERE id = $1 AND admin_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    return res.json({ message: 'Quiz session deleted successfully' });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// QUESTIONS
// -------------------------------------------------------------

// POST /sessions/:id/questions — add a question
router.post('/sessions/:id/questions', async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, sort_order } = req.body;

    // Verify session belongs to this admin
    const sessionCheck = await pool.query(
      'SELECT id FROM quiz_sessions WHERE id = $1 AND admin_id = $2',
      [sessionId, req.user.id]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res.status(400).json({
        error: 'question_text, option_a, option_b, option_c, option_d, and correct_option are all required',
      });
    }

    const normalizedCorrect = correct_option.toString().trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(normalizedCorrect)) {
      return res.status(400).json({ error: 'correct_option must be A, B, C, or D' });
    }

    let calculatedOrder = sort_order;
    if (calculatedOrder === undefined || calculatedOrder === null) {
      const orderQuery = await pool.query(
        'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM questions WHERE session_id = $1',
        [sessionId]
      );
      calculatedOrder = orderQuery.rows[0].next_order;
    }

    const result = await pool.query(
      `INSERT INTO questions (session_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, session_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, created_at`,
      [
        sessionId,
        question_text.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        normalizedCorrect,
        calculatedOrder,
      ]
    );

    return res.status(201).json({
      message: 'Question added successfully',
      question: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
});

// GET /sessions/:id/questions — list questions for a session (includes correct_option)
router.get('/sessions/:id/questions', async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    // Verify session belongs to this admin
    const sessionCheck = await pool.query(
      'SELECT id FROM quiz_sessions WHERE id = $1 AND admin_id = $2',
      [sessionId, req.user.id]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    const result = await pool.query(
      `SELECT id, session_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, created_at
       FROM questions
       WHERE session_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [sessionId]
    );

    return res.json({ questions: result.rows });
  } catch (error) {
    return next(error);
  }
});

// PUT /questions/:id — update a question
router.put('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, sort_order } = req.body;

    // Verify question belongs to an admin's session
    const existing = await pool.query(
      `SELECT q.id 
       FROM questions q
       JOIN quiz_sessions qs ON q.session_id = qs.id
       WHERE q.id = $1 AND qs.admin_id = $2`,
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    let normalizedCorrect = null;
    if (correct_option !== undefined) {
      normalizedCorrect = correct_option.toString().trim().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(normalizedCorrect)) {
        return res.status(400).json({ error: 'correct_option must be A, B, C, or D' });
      }
    }

    const result = await pool.query(
      `UPDATE questions
       SET 
         question_text = COALESCE($1, question_text),
         option_a = COALESCE($2, option_a),
         option_b = COALESCE($3, option_b),
         option_c = COALESCE($4, option_c),
         option_d = COALESCE($5, option_d),
         correct_option = COALESCE($6, correct_option),
         sort_order = COALESCE($7, sort_order)
       WHERE id = $8
       RETURNING id, session_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, created_at`,
      [
        question_text ? question_text.trim() : null,
        option_a ? option_a.trim() : null,
        option_b ? option_b.trim() : null,
        option_c ? option_c.trim() : null,
        option_d ? option_d.trim() : null,
        normalizedCorrect,
        sort_order !== undefined ? sort_order : null,
        id,
      ]
    );

    return res.json({
      message: 'Question updated successfully',
      question: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /questions/:id — delete a question
router.delete('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM questions
       WHERE id = $1 AND session_id IN (
         SELECT id FROM quiz_sessions WHERE admin_id = $2
       )
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    return res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// MONITORING & LEADERBOARD
// -------------------------------------------------------------

// GET /sessions/:id/participants — list participants
router.get('/sessions/:id/participants', async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    // Verify session belongs to this admin
    const sessionCheck = await pool.query(
      'SELECT id, title FROM quiz_sessions WHERE id = $1 AND admin_id = $2',
      [sessionId, req.user.id]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    const result = await pool.query(
      `SELECT 
         qa.id AS attempt_id,
         u.id AS student_id,
         u.full_name AS student_name,
         u.email AS student_email,
         qa.score,
         qa.total_questions,
         qa.time_taken_ms,
         qa.started_at,
         qa.submitted_at,
         qa.status
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       WHERE qa.session_id = $1
       ORDER BY qa.score DESC NULLS LAST, qa.time_taken_ms ASC NULLS LAST, qa.started_at ASC`,
      [sessionId]
    );

    return res.json({ participants: result.rows });
  } catch (error) {
    return next(error);
  }
});

// GET /sessions/:id/leaderboard — full leaderboard sorted by score DESC, time_taken_ms ASC
router.get('/sessions/:id/leaderboard', async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    const sessionCheck = await pool.query(
      'SELECT id, title FROM quiz_sessions WHERE id = $1 AND admin_id = $2',
      [sessionId, req.user.id]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    const result = await pool.query(
      `SELECT 
         ROW_NUMBER() OVER (ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC)::int AS rank,
         qa.id AS attempt_id,
         u.id AS student_id,
         u.full_name AS student_name,
         u.email AS student_email,
         qa.score,
         qa.total_questions,
         qa.time_taken_ms,
         qa.submitted_at
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       WHERE qa.session_id = $1 AND qa.status = 'submitted'
       ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC`,
      [sessionId]
    );

    return res.json({ leaderboard: result.rows });
  } catch (error) {
    return next(error);
  }
});

// GET /sessions/:id/export — export results as CSV
router.get('/sessions/:id/export', async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    const sessionCheck = await pool.query(
      'SELECT id, title FROM quiz_sessions WHERE id = $1 AND admin_id = $2',
      [sessionId, req.user.id]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    const result = await pool.query(
      `SELECT 
         ROW_NUMBER() OVER (ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC)::int AS rank,
         u.full_name AS student_name,
         u.email AS student_email,
         qa.score,
         qa.total_questions,
         qa.time_taken_ms
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       WHERE qa.session_id = $1 AND qa.status = 'submitted'
       ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC`,
      [sessionId]
    );

    // CSV Headers: Rank, Student Name, Email, Score, Total Questions, Time Taken (seconds)
    const csvRows = [
      'Rank,Student Name,Email,Score,Total Questions,Time Taken (seconds)',
    ];

    for (const row of result.rows) {
      const timeTakenSec = row.time_taken_ms !== null ? (row.time_taken_ms / 1000).toFixed(1) : '0';
      const escapeCsv = (str) => {
        if (str === null || str === undefined) return '""';
        const stringVal = String(str);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return `"${stringVal}"`;
      };

      csvRows.push([
        row.rank,
        escapeCsv(row.student_name),
        escapeCsv(row.student_email),
        row.score !== null ? row.score : 0,
        row.total_questions !== null ? row.total_questions : 0,
        timeTakenSec,
      ].join(','));
    }

    const csvContent = csvRows.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="quiz-results-${sessionId}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
