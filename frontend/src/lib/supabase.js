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
      id,
      title,
      description,
      join_code,
      duration_minutes,
      created_at,
      status,
      questions (id)
    `)
    .eq('status', 'live')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((s) => ({
    ...s,
    question_count: s.questions ? s.questions.length : 0,
  }));
};

export const joinQuizSession = async (joinCode) => {
  const { data, error } = await supabase.rpc('join_quiz_session', {
    p_join_code: joinCode,
  });
  if (error) throw error;
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
      id,
      admin_id,
      title,
      description,
      join_code,
      duration_minutes,
      status,
      created_at,
      updated_at,
      questions (id),
      quiz_attempts (id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((s) => ({
    ...s,
    question_count: s.questions ? s.questions.length : 0,
    participant_count: s.quiz_attempts ? s.quiz_attempts.length : 0,
  }));
};

export const createQuizSession = async ({ title, description, duration_minutes }) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  // Generate 6-char random join code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let joinCode = '';
  for (let i = 0; i < 6; i++) {
    joinCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert([
      {
        admin_id: session.user.id,
        title,
        description,
        duration_minutes: parseInt(duration_minutes, 10),
        join_code: joinCode,
        status: 'draft',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateQuizSession = async (sessionId, updateData) => {
  const payload = {
    ...updateData,
    updated_at: new Date().toISOString(),
  };
  if (payload.status) {
    payload.status = payload.status.toLowerCase();
  }

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update(payload)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
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
  return data;
};

export const addQuestion = async (sessionId, questionData) => {
  const { data, error } = await supabase
    .from('questions')
    .insert([{ ...questionData, session_id: sessionId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateQuestion = async (questionId, questionData) => {
  const { data, error } = await supabase
    .from('questions')
    .update(questionData)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQuestion = async (questionId) => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
};

