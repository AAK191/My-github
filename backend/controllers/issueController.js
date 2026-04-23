const mongoose = require('mongoose');
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {
    const { title, description } = req.body;
    const { id } = req.params;

    try {
        const issue = new Issue({
            title,
            description,
            repository: id,
        })

        await issue.save();
        res.status(201).json(issue);

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");

    }
};

async function updateIssueById(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({ error: "Issue not found! " });
        }

        issue.title = title;
        issue.description = description;
        issue.status = status;

        await issue.save();

        return res.json(issue, { message: "issue updated" });

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");
    }
}

async function getAllIssues(req, res) {
    try {

        const issues = Issue.find({ repository: id});

        if (!issues) {
            return res.status(404).json("there are no issues");
        }
        return res.status(200).json(issues);

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");
    }
}

async function getIssueById(req, res) {
    const { id } = req.params;

    try {
        const issue = Issue.findById(id);

        if (!issue) {
            return res.status(404).json("there are no issue of this id");
        }
        return res.status(200).json(issue);
    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");

    }

}

async function deleteIssueById(req, res) {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID" });
        }

        const issue = await Issue.findByIdAndDelete(id);

        if (!issue) {
            return res.status(404).json({ error: "issue not found!" });
        }
        return res.json({ message: "issue deleted" });

    } catch (err) {
        console.log("Error during issue deletion: ", err);
        res.status(500).send("Server error");

    }
}

async function toggleVisibilityById(req, res) {
    res.send("Repository visiblity toggeled")
}

module.exports = {
    createIssue,
    getAllIssues,
    getIssueById,
    updateIssueById,
    deleteIssueById,
    toggleVisibilityById,
}
