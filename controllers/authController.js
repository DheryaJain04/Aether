const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "aether_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("FATAL: JWT_SECRET environment variable is not set. Refusing to start with an insecure configuration.");
    }
    return process.env.JWT_SECRET;
}

function validatePasswordPolicy(password) {
    if (!password || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (password.length > 72) {
        return "Password cannot exceed 72 characters.";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return "Password must contain at least one special character.";
    }
    return null;
}

function setAuthCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SEVEN_DAYS_MS
    });
}

// POST /api/auth/signup
async function signup(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "Full name is required." });
        }

        if (name.trim().length > 100) {
            return res.status(400).json({ error: "Full name cannot exceed 100 characters." });
        }

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ error: "Email address is required." });
        }

        if (email.trim().length > 255) {
            return res.status(400).json({ error: "Email address cannot exceed 255 characters." });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ error: "Please enter a valid email address." });
        }

        const passwordError = validatePasswordPolicy(password);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                error: "An account with this email already exists. Please sign in instead."
            });
        }

        // Salt and hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash
        });

        // Generate JWT token (7 days)
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            getJwtSecret(),
            { expiresIn: "7d" }
        );

        setAuthCookie(res, token);

        return res.status(201).json({
            message: "Account created successfully.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error("Signup error:", err.message);
        return res.status(500).json({
            error: "Unable to complete registration. Please try again."
        });
    }
}

// POST /api/auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are both required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            getJwtSecret(),
            { expiresIn: "7d" }
        );

        setAuthCookie(res, token);

        return res.json({
            message: "Signed in successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({
            error: "Unable to sign in. Please try again."
        });
    }
}

// POST /api/auth/logout
function logout(req, res) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax"
    });

    return res.json({
        message: "Signed out successfully."
    });
}

// GET /api/auth/me
async function getMe(req, res) {
    try {
        const user = await User.findById(req.user.id).select("-passwordHash");
        if (!user) {
            res.clearCookie(COOKIE_NAME, {
                httpOnly: true,
                sameSite: "lax"
            });
            return res.status(401).json({ error: "User session not found." });
        }

        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error("GetMe error:", err.message);
        return res.status(500).json({ error: "Failed to verify session." });
    }
}

module.exports = {
    signup,
    login,
    logout,
    getMe
};
