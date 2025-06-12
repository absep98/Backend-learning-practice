const jwt = require("jsonwebtoken");
const MYSECRETKEY = process.env.JWT_SECRET || "mysecretkey";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({ error: "Authorization header is missing or invalid. "})
    }

    const token = authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({ error: "Access denied. No token provided"});
    }
    
    try {
        const decoded = jwt.verify(token, MYSECRETKEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token."});
    }
};

module.exports = authenticateToken;