const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ message: "Authentication is not configured" });
        }
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. Token missing."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.id || !decoded.role) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        const user = await User.findById(decoded.id).select("role +tokenVersion");
        if (!user || user.role !== decoded.role || (user.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
            return res.status(401).json({ message: "Invalid or revoked token" });
        }

        req.user = decoded;

        return next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "You are not authorized to perform this action" });
    }
    return next();
};

module.exports = protect;
module.exports.authorizeRoles = authorizeRoles;