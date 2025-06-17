const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2,
    message: {
        error: "Too many attemps from this IP, Please try again after 15 mins"
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = authLimiter;