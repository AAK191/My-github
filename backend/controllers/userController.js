const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require("mongodb");
const dotenv = require('dotenv');
var ObjectId = require("mongodb").ObjectId;
const mongoose = require('mongoose');
const User = require("../models/userModel");

dotenv.config();
const uri = process.env.MONGODB_URI;

let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
}


async function signup(req, res) {

    console.log("Body received:", req.body);
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        await connectClient();

        const db = client.db("my-github");
        const usersCollection = db.collection("users");


        const user = await usersCollection.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists!" });
        }


        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            startRepos: [],
        }

        const result = await usersCollection.insertOne(newUser);

        const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        res.json({ token, userId: result.insertedId });

    } catch (err) {
        console.error("Error during signup", err.message);
        res.status(500).json({ error: err.message });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!password || !email) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        await connectClient();

        const db = client.db("my-github");
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, userId: user._id });


    } catch (err) {
        console.error("Error during signup", err.message);
        res.status(500).json({ error: err.message });
    }


}


async function getAllUsers(req, res) {

    try {
        await connectClient();
        const db = client.db("my-github");
        const usersCollection = db.collection("users");
        const users = await usersCollection.find({}).toArray();

        res.json(users);
    } catch (err) {
        console.error("Error during signup", err.message);
        res.status(500).json({ error: err.message });
    }
};


async function getUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("my-github");
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({
            _id: new ObjectId(currentID)
        });

        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }

        return res.json(user);
    } catch (err) {
        console.error("Error during signup", err.message);
        res.status(500).json({ error: err.message });

    }
}

async function updateUserProfile(req, res) {
    const { email, password } = req.body;
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("my-github");
        const usersCollection = db.collection("users");

        let updateFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        const result = await usersCollection.findOneAndUpdate(
            {
                _id: new ObjectId(currentID),
            },
            { $set: updateFields },
            { returnDocument: "after" }
        );

        if (!result) {
            return res.status(500).send("server error");
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: result.value
        });
    } catch (err) {
        console.error("Error during signup", err.message);
        res.status(500).json({ error: err.message });
    }
}

async function deleteUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("my-github");
        const usersCollection = db.collection("users");

        const result = await usersCollection.deleteOne({
            _id: new ObjectId(currentID),
        });

        if (result.deletedCount == 0) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.json({ message: "User Profile Deleted!" });

    } catch (err) {
        console.error("Error during signup", err.message);
        res.status(500).json({ error: err.message });

    }
}

async function followUser(req, res) {
    const targetUserId = req.params.id;
    const { currentUserId } = req.body;

    console.log("params:", req.params);
    console.log("body:", req.body);

    if (!ObjectId.isValid(targetUserId) || !ObjectId.isValid(currentUserId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    if (targetUserId === currentUserId) {
        return res.status(400).json({ error: "You cannot follow yourself" });
    }

    try {
        await connectClient();
        const db = client.db("my-github");
        const usersCollection = db.collection("users");

        const targetUser = await usersCollection.findOne({ _id: new ObjectId(targetUserId) });
        const currentUser = await usersCollection.findOne({ _id: new ObjectId(currentUserId) });

        if (!targetUser || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // followers may not exist yet on old documents, so default to []
        const followers = targetUser.followers || [];
        const isAlreadyFollowing = followers.map(id => id.toString()).includes(currentUserId);

        if (isAlreadyFollowing) {
            await usersCollection.updateOne(
                { _id: new ObjectId(targetUserId) },
                { $pull: { followers: new ObjectId(currentUserId) } }
            );
            await usersCollection.updateOne(
                { _id: new ObjectId(currentUserId) },
                { $pull: { following: new ObjectId(targetUserId) } }
            );
            return res.json({ message: "Unfollowed", following: false });
        } else {
            await usersCollection.updateOne(
                { _id: new ObjectId(targetUserId) },
                { $push: { followers: new ObjectId(currentUserId) } }
            );
            await usersCollection.updateOne(
                { _id: new ObjectId(currentUserId) },
                { $push: { following: new ObjectId(targetUserId) } }
            );
            return res.json({ message: "Followed", following: true });
        }

    } catch (err) {
        console.error("Error during follow: ", err);
        res.status(500).send("Server error");
    }
}


module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    followUser,
}
