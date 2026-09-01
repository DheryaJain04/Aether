const jwt = require("jsonwebtoken");

function protect(req, res, next) {
    try {
        const token = req.cookies?.aether_token;

        if (!token) {
            return res.status(401).json({
                error: "Authentication required. Please sign in."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "aether_super_secret_jwt_key_2026_scholar_ai"
        );

        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    } catch (err) {
        // Clear invalid or expired cookie
        res.clearCookie("aether_token", {
            httpOnly: true,
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
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "aether_super_secret_jwt_key_2026_scholar_ai"
            );
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
