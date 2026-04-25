const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");


const yargs = require('yargs');

const { hideBin } = require("yargs/helpers");

const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { initRepo } = require("./controllers/init");
const { pullRepo } = require("./controllers/pull");
const { pushRepo } = require("./controllers/push");
const { revertRepo } = require("./controllers/revert");

dotenv.config();

yargs(hideBin(process.argv))
    .command("start", "starts a new server", {}, startServer)
    .command("add <file>", "Add a file to the repository", (yargs) => {
        yargs.positional("file", {
            describe: "File to add to the staging area",
            type: "string",
        });
    },
        (argv) => {
            addRepo(argv.file);
        })

    .command(
        "commit <message>",
        "commit the stage files",
        (yargs) => {
            yargs.positional("message", {
                describe: "commit message",
                type: "string",
            });
        }, (argv) => {
            commitRepo(argv.message);
        })

    .command('init', 'Initialize a new repository',
        {
            username: {
                describe: 'Your username on the website',
                type: 'string',
                demandOption: true,
            },
            reponame: {
                describe: 'Your repository name on the website',
                type: 'string',
                demandOption: true,
            }
        },
        async (argv) => {
            const mongoURI = process.env.MONGODB_URI;
            await mongoose.connect(mongoURI);

            const User = require("./models/userModel");
            const Repo = require("./models/repoModel");

            const user = await User.findOne({ username: argv.username });
            if (!user) {
                console.error(`❌ User "${argv.username}" not found`);
                process.exit(1);
            }

            const repo = await Repo.findOne({ name: argv.reponame, owner: user._id });
            if (!repo) {
                console.error(`❌ Repo "${argv.reponame}" not found for user "${argv.username}"`);
                process.exit(1);
            }

            await initRepo(repo._id.toString(), user._id.toString());
            await mongoose.disconnect();
        }
    )
    .command("pull", "Initialize a new repositroy", {}, pullRepo)
    .command("push", "Initialize a new repositroy", {}, pushRepo)
    .command("revert <commitID>", "Revert the specifi commit",
        (yargs) => {
            yargs.positional("commitID", {
                describr: "comit ID to revert to",
                type: "string",
            });
        },
        (argv) => {
            revertRepo(argv)
        }
    )

    .demandCommand(1, "You nned to set atleast 1 command")
    .help().argv;

function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(bodyParser.json());

    const mongoURI = process.env.MONGODB_URI;

    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use("/", mainRouter);

    mongoose
        .connect(mongoURI)
        .then(() => console.log("MongoDB connected!"))
        .catch((err) => console.error("Unable to connect: ", err));




    let user = "test";
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            user = userID;
            console.log("=====");
            console.log(user);
            console.log("=====");
            socket.join(userID);
        })
    });

    const db = mongoose.connection;

    db.once("open", async () => {
        console.log("CRUD operations called");
    });

    httpServer.listen(port, () => {
        console.log(`Server is running on PORT ${port}`);
    });

} 