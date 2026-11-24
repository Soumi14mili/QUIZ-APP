import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://inumdfmqdjvdovgfject.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludW1kZm1xZGp2ZG92Z2ZqZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NDExMDEsImV4cCI6MjExMTAxNzEwMX0.cLSXZESkAaLnNLEzJ2MKIpWH8ExycBuVefi8_exbXys';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ==========================================
// Authentication Helpers
// ==========================================

export const signUpStudent = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'student',
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signUpAdmin = async (email, password, fullName, secretKey) => {
  const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'Admin@CloudQuest2026';
  if (!secretKey || secretKey.trim() !== expectedSecret) {
    throw new Error('Invalid Admin Secret Key. Registration denied.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'admin',
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signInUser = async (email, password, isAdmin = false) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // Verify profile role
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileErr) throw profileErr;

  if (isAdmin && profile.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Access denied: Admin credentials required.');
  }

  return { ...data, profile };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUserProfile = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) return null;
  return profile;
};

// ==========================================
// Student Quiz Helpers (RPCs & Queries)
// ==========================================

export const getLiveSessions = async () => {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select(`
      *,
      questions (id, time_limit_seconds)
    `)
    .eq('status', 'live')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((s) => {
    const durSec = s.duration_seconds || (s.duration_minutes ? s.duration_minutes * 60 : 900);
    const durMin = s.duration_minutes || Math.max(1, Math.ceil(durSec / 60));
    return {
      ...s,
      duration_seconds: durSec,
      duration_minutes: durMin,
      timer_mode: s.timer_mode || 'quiz',
      question_count: s.questions ? s.questions.length : 0,
    };
  });
};

export const joinQuizSession = async (joinCode) => {
  const { data, error } = await supabase.rpc('join_quiz_session', {
    p_join_code: joinCode,
  });
  if (error) throw error;

  // Ensure default fallback timer properties on joined session
  if (data?.session) {
    const s = data.session;
    const durSec = s.duration_seconds || (s.duration_minutes ? s.duration_minutes * 60 : 900);
    data.session.duration_seconds = durSec;
    data.session.duration_minutes = s.duration_minutes || Math.max(1, Math.ceil(durSec / 60));
    data.session.timer_mode = s.timer_mode || 'quiz';
  }

  // Ensure default time_limit_seconds on each question
  if (Array.isArray(data?.questions)) {
    data.questions = data.questions.map((q) => ({
      ...q,
      time_limit_seconds: q.time_limit_seconds || 30,
    }));
  }

  return data;
};

export const submitQuizAttempt = async (attemptId, answers) => {
  const { data, error } = await supabase.rpc('submit_quiz_attempt', {
    p_attempt_id: attemptId,
    p_answers: answers,
  });
  if (error) throw error;
  return data;
};

export const getAttemptResult = async (attemptId) => {
  const { data, error } = await supabase.rpc('get_attempt_result', {
    p_attempt_id: attemptId,
  });
  if (error) throw error;
  return data;
};

export const getSessionLeaderboard = async (sessionId) => {
  const { data, error } = await supabase.rpc('get_session_leaderboard', {
    p_session_id: sessionId,
  });
  if (error) throw error;
  return data;
};

// ==========================================
// Admin Helpers (Full CRUD & Monitoring)
// ==========================================

export const getAdminSessions = async () => {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select(`
      *,
      questions (id, time_limit_seconds),
      quiz_attempts (id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((s) => {
    const durSec = s.duration_seconds || (s.duration_minutes ? s.duration_minutes * 60 : 900);
    const durMin = s.duration_minutes || Math.max(1, Math.ceil(durSec / 60));
    return {
      ...s,
      duration_seconds: durSec,
      duration_minutes: durMin,
      timer_mode: s.timer_mode || 'quiz',
      question_count: s.questions ? s.questions.length : 0,
      participant_count: s.quiz_attempts ? s.quiz_attempts.length : 0,
    };
  });
};

export const createQuizSession = async ({ title, description, duration_minutes, duration_seconds, timer_mode }) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  // Generate 6-char random join code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let joinCode = '';
  for (let i = 0; i < 6; i++) {
    joinCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  let finalSeconds = parseInt(duration_seconds, 10);
  let finalMinutes = parseInt(duration_minutes, 10);

  if (isNaN(finalSeconds) || finalSeconds <= 0) {
    if (!isNaN(finalMinutes) && finalMinutes > 0) {
      finalSeconds = finalMinutes * 60;
    } else {
      finalSeconds = 900;
    }
  }
  finalMinutes = Math.max(1, Math.ceil(finalSeconds / 60));
  const finalMode = timer_mode === 'question' ? 'question' : 'quiz';

  const insertPayload = {
    admin_id: session.user.id,
    title,
    description,
    duration_minutes: finalMinutes,
    duration_seconds: finalSeconds,
    timer_mode: finalMode,
    join_code: joinCode,
    status: 'draft',
  };

  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert([insertPayload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    // Graceful fallback if database does not yet have duration_seconds or timer_mode columns
    console.warn('Fallback inserting quiz_session without optional timer fields:', err);
    const fallbackPayload = {
      admin_id: session.user.id,
      title,
      description,
      duration_minutes: finalMinutes,
      join_code: joinCode,
      status: 'draft',
    };
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert([fallbackPayload])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      duration_seconds: finalSeconds,
      timer_mode: finalMode,
    };
  }
};

export const updateQuizSession = async (sessionId, updateData) => {
  const payload = {
    ...updateData,
    updated_at: new Date().toISOString(),
  };
  if (payload.status) {
    payload.status = payload.status.toLowerCase();
  }

  if (payload.duration_seconds !== undefined) {
    const secs = parseInt(payload.duration_seconds, 10);
    if (!isNaN(secs) && secs > 0) {
      payload.duration_seconds = secs;
      payload.duration_minutes = Math.max(1, Math.ceil(secs / 60));
    }
  } else if (payload.duration_minutes !== undefined) {
    const mins = parseInt(payload.duration_minutes, 10);
    if (!isNaN(mins) && mins > 0) {
      payload.duration_minutes = mins;
      payload.duration_seconds = mins * 60;
    }
  }

  if (payload.timer_mode && !['quiz', 'question'].includes(payload.timer_mode)) {
    payload.timer_mode = 'quiz';
  }

  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .update(payload)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    // If optional column error, fallback without duration_seconds / timer_mode
    console.warn('Fallback updating quiz_session:', err);
    const { duration_seconds, timer_mode, ...safePayload } = payload;
    const { data, error } = await supabase
      .from('quiz_sessions')
      .update(safePayload)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      duration_seconds: payload.duration_seconds || (data.duration_minutes * 60),
      timer_mode: payload.timer_mode || 'quiz',
    };
  }
};

export const deleteQuizSession = async (sessionId) => {
  const { error } = await supabase
    .from('quiz_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
};

export const getSessionQuestions = async (sessionId) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((q) => ({
    ...q,
    time_limit_seconds: q.time_limit_seconds || 30,
  }));
};

export const addQuestion = async (sessionId, questionData) => {
  const timeLimit = parseInt(questionData.time_limit_seconds, 10) || 30;
  const payload = {
    ...questionData,
    time_limit_seconds: timeLimit,
    session_id: sessionId,
  };

  try {
    const { data, error } = await supabase
      .from('questions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Fallback inserting question without time_limit_seconds:', err);
    const { time_limit_seconds, ...safePayload } = payload;
    const { data, error } = await supabase
      .from('questions')
      .insert([safePayload])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      time_limit_seconds: timeLimit,
    };
  }
};

export const updateQuestion = async (questionId, questionData) => {
  const timeLimit = questionData.time_limit_seconds !== undefined
    ? parseInt(questionData.time_limit_seconds, 10) || 30
    : undefined;

  const payload = {
    ...questionData,
  };
  if (timeLimit !== undefined) {
    payload.time_limit_seconds = timeLimit;
  }

  try {
    const { data, error } = await supabase
      .from('questions')
      .update(payload)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Fallback updating question without time_limit_seconds:', err);
    const { time_limit_seconds, ...safePayload } = payload;
    const { data, error } = await supabase
      .from('questions')
      .update(safePayload)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      time_limit_seconds: timeLimit || 30,
    };
  }
};

export const deleteQuestion = async (questionId) => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
};

