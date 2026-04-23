const fs = require('fs');
const path = require('path');

function revertRepo(argv) {
  const commitId = argv.commitID;
  const commitPath = path.join('.my-github/commits', commitId);

  // Check if commit exists locally
  if (!fs.existsSync(commitPath)) {
    console.error(`❌ Commit not found: ${commitId}`);
    console.log('Tip: Run "node index.js pull" first to download commits.');
    return;
  }

  // Read commit metadata
  const metaPath = path.join(commitPath, 'commit.json');
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    console.log(`Reverting to commit: "${meta.message}" (${commitId})`);
  }

  // Copy all files from commit folder back to working directory
  const files = fs.readdirSync(commitPath).filter(f => f !== 'commit.json');

  if (files.length === 0) {
    console.log('No files found in this commit.');
    return;
  }

  files.forEach(file => {
    const src = path.join(commitPath, file);
    const dest = path.join('.', file); // restore to root of backend
    fs.copyFileSync(src, dest);
    console.log(`✅ Restored: ${file}`);
  });

  console.log(`✅ Reverted to commit: ${commitId}`);
}

module.exports = { revertRepo };