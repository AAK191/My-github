const { supabase } = require("../config/supabaseClient");

const createFile = async (req, res) => {
    const { repo_id, name, content, path, type } = req.body;

    if (!repo_id || !name || !path || !type) {
        return res.status(400).json({ error: "repo_id, name, path and type are required" });
    }

    const { data, error } = await supabase
        .from("files")
        .insert([{ repo_id, name, content: content || "", path, type }])
        .select();

    if (error) return res.status(500).json({ error });

    res.status(201).json(data[0]);
};

const getFilesByRepo = async (req, res) => {
    const { repoId } = req.params;

    const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("repo_id", repoId)
        .order("path", { ascending: true });

    if (error) return res.status(500).json({ error });

    res.status(200).json(data);
};

const getFileById = async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return res.status(500).json({ error });

    res.status(200).json(data);
};

const deleteFile = async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from("files")
        .delete()
        .eq("id", id);

    if (error) return res.status(500).json({ error });

    res.status(200).json({ message: "File deleted successfully" });
};

const updateFile = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const { data, error } = await supabase
        .from("files")
        .update({ content })
        .eq("id", id)
        .select();

    if (error) return res.status(500).json({ error });
    res.status(200).json(data[0]);
};

const getFilesByStorage = async (req, res) => {
    const { userId, repoId } = req.params;
    const storagePath = `${userId}/${repoId}`;

    const { data, error } = await supabase.storage
        .from('MY_GITHUB')
        .list(storagePath, { recursive: true });

    if (error) return res.status(500).json({ error });

    // flatten all commit folders to get actual files
    const allFiles = [];

    for (const commitFolder of data) {
        if (commitFolder.name === '.emptyFolderPlaceholder') continue;

        const commitPath = `${storagePath}/${commitFolder.name}`;
        const { data: filesInCommit, error: err2 } = await supabase.storage
            .from('MY_GITHUB')
            .list(commitPath);

        if (err2) continue;

        for (const file of filesInCommit) {
            if (file.name === 'commit.json') continue; // skip commit metadata
            
            const fullPath = `${commitPath}/${file.name}`;
            
            
            const { data: urlData } = supabase.storage
                .from('MY_GITHUB')
                .getPublicUrl(fullPath);

            allFiles.push({
                id: file.id || fullPath,
                name: file.name,
                path: file.name,           
                storage_path: fullPath,
                url: urlData.publicUrl,
                commitId: commitFolder.name,
                type: 'file',
            });
        }
    }

    res.json(allFiles);
};

module.exports = { createFile, getFilesByRepo, getFileById, deleteFile, updateFile, getFilesByStorage };

