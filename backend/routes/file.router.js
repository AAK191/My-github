const express = require("express");
const fileRouter = express.Router();
const { createFile, getFilesByRepo, getFileById, deleteFile, updateFile, getFilesByStorage } = require("../controllers/fileController");

fileRouter.post("/file/create", createFile);
fileRouter.get("/file/repo/:repoId", getFilesByRepo);
fileRouter.get("/file/:id", getFileById);

fileRouter.delete("/file/:id", deleteFile);
fileRouter.put("/file/:id", updateFile);
fileRouter.get("/file/storage/:userId/:repoId", getFilesByStorage);

module.exports = fileRouter;