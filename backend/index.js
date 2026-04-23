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
     .command("start","starts a new server", {}, startServer)
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

    .command("init", "Initialize a new repositroy", {}, initRepo)
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
        app.use("/",mainRouter);
        
        mongoose
            .connect(mongoURI)
            .then(() => console.log("MongoDB connected!"))
            .catch((err) => console.error("Unable to connect: ",err));


               
           
        let user = "test";
        const httpServer = http.createServer(app);
        const io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        io.on("connection",(socket) => {
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