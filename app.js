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
const collectionsRouter = require("./routes/collections");
const projectsRouter = require("./routes/projects");
const historyRouter = require("./routes/history");

const cors = require("cors");
const { rateLimit } = require("express-rate-limit");

const reactBuildPath = path.join(__dirname, "client", "dist");

// CORS configuration for cross-origin client support (if running separate dev server)
const allowedOrigins = process.env.CLIENT_ORIGIN 
    ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, same-origin)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive in dev if unspecified
    },
    credentials: true
}));

// Explicit request size limits to prevent denial-of-service
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Rate limiters for security and abuse prevention
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication requests. Please try again after 15 minutes." }
});

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "AI rate limit reached. Please wait a moment before sending more queries." }
});

const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please slow down." }
});

// Security headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(reactBuildPath));

// Apply rate limiting & mount API routes
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/search", generalApiLimiter, apiSearchRouter);
app.use("/api/papers", generalApiLimiter, apiPapersRouter);
app.use("/api/lab", aiLimiter, labRouter);
app.use("/api/collections", generalApiLimiter, collectionsRouter);
app.use("/api/projects", generalApiLimiter, projectsRouter);
app.use("/api/history", generalApiLimiter, historyRouter);
app.use("/paper", aiLimiter, paperRouter);

// React SPA Client-Side Routing: Send index.html for all frontend routes
app.get("{*path}", (req, res) => {
    res.sendFile(path.join(reactBuildPath, "index.html"));
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
