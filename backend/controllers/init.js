const fs = require("fs").promises;
const path = require("path");

async function initRepo(repoId, userId) {  // ✅ accept repoId and userId
    const repoPath = path.resolve(process.cwd(), ".my-github");
    const commitsPath = path.join(repoPath, "commits");

    try {
        await fs.mkdir(repoPath, { recursive: true });
        await fs.mkdir(commitsPath, { recursive: true });

        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({
                bucket: process.env.S3_BUCKET,
                repoId: repoId || "",   // ✅ store repoId
                userId: userId || "",   // ✅ store userId
            }, null, 2)
        );

        console.log("✅ Repository initialised!");
        if (!repoId) console.log("⚠️  Add your repoId to .my-github/config.json");
        if (!userId) console.log("⚠️  Add your userId to .my-github/config.json");

    } catch (err) {
        console.log("Error initialising repository:", err.message);
    }
}

module.exports = { initRepo };