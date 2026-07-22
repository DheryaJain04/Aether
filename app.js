const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
const port = 3000;

connectDB();

const homeRouter = require("./routes/home");
const searchRouter = require("./routes/search");
const paperRouter = require("./routes/paper");
const savedRouter = require("./routes/saved");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));

app.use("/", homeRouter);
app.use("/search", searchRouter);
app.use("/paper", paperRouter);
app.use("/saved", savedRouter);

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})