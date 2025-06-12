const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/authController")
const authenticateToken = require("../middleware/authMiddeware");
const { checkRole } = require("../middleware/checkRole");
const jwt = require('jsonwebtoken');
const { refreshTokensStore } = require("../utils/tokenStore");

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

router.post("/logout", (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    });
    res.status(200).json({message:"Logged out successfully"});
})

module.exports = router;