const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/authController")
const authenticateToken = require("../middleware/authMiddeware");
const { checkRole } = require("../middleware/checkRole");

router.post("/signup", signup);

router.post("/login", login);

router.get("/profile", authenticateToken, (req, res) => {
    res.json({ 
        message: `Welcome ${req.user.username}! This is your profile.`,
        user: req.user
    })
});

router.get("/admin-only", authenticateToken, checkRole("admin"), (req, res) => {
    res.json({
        message:`You are an admin. You can access this route`
    });
});

module.exports = router;