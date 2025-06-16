const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { login, signup, logout, forgotPassword } = require("../controllers/authController")
const authenticateToken = require("../middleware/authMiddeware");
const { checkRole } = require("../middleware/checkRole");
const jwt = require('jsonwebtoken');
const { refreshTokensStore } = require("../utils/tokenStore");
const User = require("../models/userModel");

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh", (req, res) => {
    // Try to get refresh token from cookies first, then from body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!refreshToken){
        return res.status(401).json({ error : "Refresh token missing"})
    }

    if(!refreshTokensStore.has(refreshToken)) {
        return res.status(403).json({ error: "Refresh refresh token" });
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log(payload);
        
        const newAccessToken = jwt.sign({ id: payload.id, role: payload.role}, process.env.JWT_SECRET, { expiresIn: '30m' } );

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        res.status(403).json({ error: "Invalid refresh token" });
    }

})

router.get("/profile", authenticateToken, (req, res) => {
    res.json({ 
        message: `Welcome ${req.user.email}! This is your profile.`,
        email: req.user.email
    })
});

router.get("/admin-only", authenticateToken, checkRole("admin"), (req, res) => {
    res.json({
        message:`You are an admin. You can access this route`
    });
});

// Debug route to check cookies
router.get("/debug-cookies", (req, res) => {
    res.json({
        cookies: req.cookies,
        headers: req.headers,
        hasCookieParser: !!req.cookies,
        accessToken: req.cookies?.accessToken ? "Present" : "Missing",
        refreshToken: req.cookies?.refreshToken ? "Present" : "Missing"
    });
});

router.get("/verify/:token", async(req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if(!user) {
            return res.status(404).json({ error: "User not found." });
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully!" });

    } catch (error) {
        console.error("Verification error : ", error);
        res.status(500).json({ error: "Internal server error."});
    }
})

router.post("/logout", logout)


// Manual verification endpoint for development
router.post("/verify-user", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        
        const Users = require("../models/userModel");
        const user = await Users.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (user.isVerified) {
            return res.status(200).json({ message: "User is already verified" });
        }
        
        user.isVerified = true;
        await user.save();
        
        res.status(200).json({ message: "User verified successfully" });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "Failed to verify user" });
    }
});


router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", async(req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if(!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error : "Password must be at least 8 characters long."});
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt : Date.now() }
        });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successfully."})

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something weng wrong in reseting the password."})
    }
})

module.exports = router;
