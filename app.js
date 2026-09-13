require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

connectDB();

const authRouter = require("./routes/auth");
const apiSearchRouter = require("./routes/apiSearch");
const apiPapersRouter = require("./routes/apiPapers");
const paperRouter = require("./routes/paper");
const labRouter = require("./routes/lab");

const reactBuildPath = path.join(__dirname, "client", "dist");

// Explicit request size limits to prevent denial-of-service
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(reactBuildPath));

// API & AI endpoints consumed by the React client
app.use("/api/auth", authRouter);
app.use("/api/search", apiSearchRouter);
app.use("/api/papers", apiPapersRouter);
app.use("/api/lab", labRouter);
app.use("/paper", paperRouter);

// React SPA Client-Side Routing: Send index.html for all frontend routes
app.get("{*path}", (req, res) => {
    res.sendFile(path.join(reactBuildPath, "index.html"));
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
