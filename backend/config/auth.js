const { supabase } = require('./supabaseClient.js');

// Sign up a new user
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// Sign in existing user
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current logged-in user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

module.exports = {
  signUp,
  signIn,
  signOut,
  getCurrentUser
};