const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /sessions/:id — get leaderboard for a session (Any authenticated user can view)
router.get('/sessions/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    // Check if session exists
    const sessionCheck = await pool.query(
      'SELECT id, title, status FROM quiz_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    const result = await pool.query(
      `SELECT 
         ROW_NUMBER() OVER (ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC)::int AS rank,
         u.full_name AS student_name,
         qa.score,
         qa.total_questions,
         qa.time_taken_ms
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       WHERE qa.session_id = $1 AND qa.status = 'submitted'
       ORDER BY qa.score DESC, qa.time_taken_ms ASC, qa.submitted_at ASC`,
      [sessionId]
    );

    return res.json({
      session_id: sessionId,
      session_title: sessionCheck.rows[0].title,
      leaderboard: result.rows,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
