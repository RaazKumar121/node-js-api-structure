const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const app = express();

const connect = require("./src/config/db");
const authRoutes = require("./src/routes/Auth.routes");
const appRouter = require("./src/routes/App.routes");
// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.use(helmet());
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

app.get("/", function (req, res) {
    res.json({ message: "Working" });
});
// routes 
app.get("/v1", function (req, res) {
    res.json({ message: "Welcome" });
});

app.use("/v1", appRouter)
app.use("/v1/auth", authRoutes)

connect()
    .then(() => {
        try {
            app.listen(process.env.PORT, () => {
                console.log(`Server connected to http://localhost:${process.env.PORT}`);
            });
        } catch (error) {
            console.log("Cannot connect to the server: ", error);
        }
    })
    .catch((error) => {
        console.log("Invalid database connection: ", error);
    });
