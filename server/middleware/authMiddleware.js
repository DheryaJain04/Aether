const jwt = require("jsonwebtoken");

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("FATAL: JWT_SECRET environment variable is not set.");
    }
    return process.env.JWT_SECRET;
}

function protect(req, res, next) {
    try {
        const token = req.cookies?.aether_token;

        if (!token) {
            return res.status(401).json({
                error: "Authentication required. Please sign in."
            });
        }

        const decoded = jwt.verify(token, getJwtSecret());

        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    } catch (err) {
        // Clear invalid or expired cookie
        res.clearCookie("aether_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(401).json({
            error: "Session expired or invalid. Please sign in again."
        });
    }
}

// Attaches user if token is valid, but does not block if guest
function optionalAuth(req, res, next) {
    try {
        const token = req.cookies?.aether_token;
        if (token) {
            const decoded = jwt.verify(token, getJwtSecret());
            req.user = {
                id: decoded.id,
                email: decoded.email
            };
        }
    } catch {
        // Ignore errors for optional auth
    }
    next();
}

module.exports = {
    protect,
    optionalAuth
};
