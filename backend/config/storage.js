const { supabase } = require('./supabaseClient.js');

// Upload a file to a bucket
async function uploadFile(bucket, filePath, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;
  return data;
}

// Get public URL of a file
function getPublicUrl(bucket, filePath) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Delete a file
async function deleteFile(bucket, filePath) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
}

module.exports = {
  uploadFile,
  getPublicUrl,
  deleteFile
};