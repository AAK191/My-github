const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabaseClient.js');

async function pushRepo() {
    const commitsDir = '.my-github/commits';
    const configPath = '.my-github/config.json';

    if (!fs.existsSync(commitsDir)) {
        console.log('❌ No commits directory found!');
        return;
    }

    // ✅ Read repoId from config.json
    if (!fs.existsSync(configPath)) {
        console.log('❌ No config.json found! Run init first.');
        return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const repoId = config.repoId;
    const userId = config.userId;

    if (!repoId || !userId) {
        console.log('❌ repoId or userId missing in config.json!');
        console.log('Add them manually: { "repoId": "...", "userId": "..." }');
        return;
    }

    const commits = fs.readdirSync(commitsDir);
    console.log('Found commits:', commits);

    if (commits.length === 0) {
        console.log('Nothing to push.');
        return;
    }

    for (const commitId of commits) {
        const commitPath = path.join(commitsDir, commitId);
        const files = fs.readdirSync(commitPath);
        console.log(`Pushing commit ${commitId}, files:`, files);

        for (const file of files) {
            const filePath = path.join(commitPath, file);
            const fileBuffer = fs.readFileSync(filePath);

            // ✅ New path structure: userId/repoId/commitId/filename
            const uploadPath = `${userId}/${repoId}/${commitId}/${file}`;
            console.log(`Uploading: ${uploadPath}`);

            const { data, error } = await supabase.storage
                .from('MY_GITHUB')
                .upload(uploadPath, fileBuffer, { upsert: true });

            if (error) {
                console.error(`❌ Failed to push ${file}:`, error.message);
            } else {
                console.log(`✅ Pushed: ${uploadPath}`);

                // ✅ Also save file record to DB so frontend can list it
                await supabase.from('files').upsert({
                    repo_id: repoId,
                    name: file,
                    path: `${commitId}/${file}`,
                    type: 'file',
                    storage_path: uploadPath, // ✅ full storage path
                    content: '',              // content is in storage, not DB
                }, { onConflict: 'repo_id,path' });
            }
        }
    }

    console.log('✅ Push complete!');
}

module.exports = { pushRepo };