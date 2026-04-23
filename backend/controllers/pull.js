const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabaseClient.js');

async function pullRepo() {
  const commitsDir = '.my-github/commits';

  // List all folders in the bucket
  const { data, error } = await supabase.storage
    .from('MY_GITHUB')
    .list('', { limit: 100 });

  if (error) {
    console.error('Pull failed:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('Nothing to pull.');
    return;
  }

  // Make sure local commits folder exists
  if (!fs.existsSync(commitsDir)) {
    fs.mkdirSync(commitsDir, { recursive: true });
  }

  for (const folder of data) {
    const commitId = folder.name;
    const commitPath = path.join(commitsDir, commitId);

    // List files inside each commit folder
    const { data: files, error: listError } = await supabase.storage
      .from('MY_GITHUB')
      .list(commitId);

    if (listError) {
      console.error(`Failed to list files in ${commitId}:`, listError.message);
      continue;
    }

    // Create local commit folder if not exists
    if (!fs.existsSync(commitPath)) {
      fs.mkdirSync(commitPath, { recursive: true });
    }

    for (const file of files) {
      const { data: fileData, error: dlError } = await supabase.storage
        .from('MY_GITHUB')
        .download(`${commitId}/${file.name}`);

      if (dlError) {
        console.error(`Failed to pull ${file.name}:`, dlError.message);
        continue;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      fs.writeFileSync(path.join(commitPath, file.name), buffer);
      console.log(`Pulled: ${commitId}/${file.name}`);
    }
  }

  console.log('Pull complete!');
}

module.exports = { pullRepo };