const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require("uuid");
const { supabase } = require("../config/supabaseClient"); 

async function commitRepo(message, repoId, userId){
   const repoPath = path.resolve(process.cwd(),".my-github");
   const stagedPath = path.join(repoPath, "staging");
   const commitPath = path.join(repoPath, "commits");

   try{
      const commitID = uuidv4();
      const commitDir = path.join(commitPath, commitID);
      await fs.mkdir(commitDir, { recursive:  true});

      const files = await fs.readdir(stagedPath);
      for(const file of files){
         await fs.copyFile(
            path.join(stagedPath, file),
            path.join(commitDir, file)
         );
      }

   await fs.writeFile(
      path.join(commitDir, "commit.json"), 
      JSON.stringify({message, date: new Date().toISOString()})
   );

   await supabase.from("commits").insert({
      id: commitID,
      repo_id: repoId,
      user_id: userId,
      message,
    });

    console.log(`commit ${commitID} created with message: ${message}`);

   }catch(err){
        console.log("error committing files :",err);
   }

}


module.exports = { commitRepo };