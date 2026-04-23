const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabaseClient.js');

async function pushRepo() {
  const commitsDir = '.my-github/commits';

  // DEBUG: check if folder exists
  if (!fs.existsSync(commitsDir)) {
    console.log('❌ No commits directory found!');
    return;
  }

  const commits = fs.readdirSync(commitsDir);
  console.log('Found commits:', commits); // DEBUG

  if (commits.length === 0) {
    console.log('Nothing to push.');
    return;
  }

  for (const commitId of commits) {
    const commitPath = path.join(commitsDir, commitId);
    const files = fs.readdirSync(commitPath);
    console.log(`Pushing commit ${commitId}, files:`, files); // DEBUG

    for (const file of files) {
      const filePath = path.join(commitPath, file);
      const fileBuffer = fs.readFileSync(filePath);
      const uploadPath = `${commitId}/${file}`;

      console.log(`Uploading: ${uploadPath}`); // DEBUG

      const { data, error } = await supabase.storage
        .from('MY_GITHUB')
        .upload(uploadPath, fileBuffer, { upsert: true });

      if (error) {
        console.error(`❌ Failed to push ${file}:`, error.message);
      } else {
        console.log(`✅ Pushed: ${uploadPath}`);
      }
    }
  }
}

module.exports = { pushRepo };