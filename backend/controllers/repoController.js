const mongoose = require('mongoose');
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
    const { userId, name, issues, content, description, visibility } = req.body;

    try {
        if (!name || !userId) {
            return res.status(400).json({ error: "Name and userId required!" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newRepository = new Repository({
            name,
            description,
            visibility: visibility ?? true,
            owner: userId,
            content: content || [],
            issues: issues || [],
        });

        const result = await newRepository.save();

        await User.findByIdAndUpdate(userId, {
            $push: { repositories: result._id }
        });

        res.status(201).json({
            message: "Repository created",
            repositoryID: result._id,
        });

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");
    }
}


async function getAllRepository(req, res) {
    try {

        const repositories = await Repository.find({})
            .populate("owner")
            .populate("issues");

        if (!repositories || repositories.length == 0) {
            return res.json("No repositories are present")
        }
        return res.json(repositories);

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");
    }
}

async function fetchRepositoryById(req, res) {

    const repoID = req.params.id;
    try {
        const repository = await Repository.findById(repoID)
            .populate("owner")
            .populate("issues");


        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        return res.json(repository);

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");
    }
}

async function fetchRepositoryByName(req, res) {
    const repoName = req.params.name;
    try {
        const repository = await Repository.find({ name: repoName })
            .populate("owner")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        res.json(repository);

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");
    }
}


async function fetchRepositoryForCurrentUser(req, res) {
    const userId = req.params.userID;

    try {
        const repositories = await Repository.find({ owner: userId });

         if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        
         }

        if (!repositories) {
            return res.status(404).json({ error: "User Repositories not found" });
        }
        return res.json(repositories);
    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");
    }
}

async function updateRepositoryById(req, res) {
    const { id } = req.params;
    const { content, description } = req.body;

    try {
        const repository = await Repository.findById(id);

        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        repository.content.push(content);
        repository.description = description;

        const updatedRepository = await repository.save();

        res.json({
            message: "Repository updated successfully!",
            repository: updatedRepository,
        });

    } catch (err) {
        console.log("Error during repository creation: ", err);
        res.status(500).send("Server error");

    }
}

async function toggleVisibilityById(req, res) {
    const { id } = req.params;

    try {
        const repository = await Repository.findById(id);

        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }

        repository.visibility = !repository.visibility;

        const updatedRepository = await repository.save();

        res.json({
            message: "Repository visibility toggled successfully!",
            repository: updatedRepository,
        });

    } catch (err) {
        console.log("Error during toggling visibility: ", err);
        res.status(500).send("Server error");

    }
}

async function deleteRepositoryById(req, res) {
    const { id } = req.params;
    try {
        const repository = await Repository.findByIdAndDelete(id);

        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }
        res.json({ message: "Repository deleted successfully!" });
    } catch (err) {
        console.log("Error during deleting Repository: ", err);
        res.status(500).send("Server error");
    }
}
module.exports = {
    createRepository,
    getAllRepository,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoryForCurrentUser,
    updateRepositoryById,
    deleteRepositoryById,
    toggleVisibilityById,
}
