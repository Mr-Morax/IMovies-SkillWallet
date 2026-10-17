// server/middlewares/fetchUser.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "IMOVIES_SECRET_KEY";

const fetchUser = (req, res, next) => {
    // Support both "Auth-Token" header and standard "Authorization: Bearer <token>"
    let token = req.header("Auth-Token") || req.header("auth-token");

    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
        } else {
            token = req.headers.authorization;
        }
    }

    if (!token) {
        return res.status(401).json({
            status: false,
            msg: "Access denied! Please authenticate using a valid token.",
        });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.userDetails || data.adminDetails || data;
        next();
    } catch (error) {
        return res.status(401).json({
            status: false,
            msg: "Invalid or expired authentication token.",
        });
    }
};

module.exports = fetchUser;