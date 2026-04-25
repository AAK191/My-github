const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");

const mainRouter = express.Router();
const commitRouter = require("./commit.router");
const fileRouter = require("./file.router");

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(commitRouter);
mainRouter.use(fileRouter);

mainRouter.get("/", (req,res) => {
    res.send("Welcome!");
});

module.exports = mainRouter;