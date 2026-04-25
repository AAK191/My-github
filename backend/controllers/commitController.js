const { supabase } = require("../config/supabaseClient");

const createCommit = async (req, res) => {
  const { id, repo_id, user_id, message } = req.body;

  const { data, error } = await supabase
    .from("commits")
    .insert({ id, repo_id, user_id, message })
    .select();
  
    if (error) return res.status(500).json({ error });
  res.status(201).json({ message: "Commit saved", data });
};

const getCommitsByRepo = async (req, res) => {
  const { repoId } = req.params;

  const { data, error } = await supabase
    .from("commits")
    .select("*")
    .eq("repo_id", repoId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error });
  res.json(data);
};

module.exports = { createCommit, getCommitsByRepo };