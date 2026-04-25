const express = require('express');
const commitController = require("../controllers/commitController");

const commitRouter = express.Router();

commitRouter.post("/commit/create", commitController.createCommit);
commitRouter.get("/commit/repo/:repoId", commitController.getCommitsByRepo);

module.exports = commitRouter;