const express = require("express");
const path = require("path")
const app = express();
const port = 3000;

const homeRouter = require("./routes/home");
const searchRouter = require("./routes/search");
const paperRouter = require("./routes/paper");
const savedRouter = require("./routes/saved");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname,"public")));

app.use("/", homeRouter);
app.use("/search", searchRouter);
app.use("/paper", paperRouter);
app.use("/saved", savedRouter);

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})