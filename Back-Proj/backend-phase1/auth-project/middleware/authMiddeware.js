const jwt = require("jsonwebtoken");
const MYSECRETKEY = "mysecretkey";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({ error: "Access denied. No token provided"});
    }
    
    jwt.verify(token, MYSECRETKEY, (err, user) => {
        if(err) {
            return res.status(401).json({message: "Invalid or expired token"});
        }
        console.log("Decoded token ", user);
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;