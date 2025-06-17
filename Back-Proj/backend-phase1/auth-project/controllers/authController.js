const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendResetPasswordEmail = require("../utils/sendResetPasswordEmail")
const User = require("../models/userModel");
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

const { refreshTokensStore } = require("../utils/tokenStore");
const { log, error } = require("console");

const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        console.log({ username, email, password, role });
        // Add input validation
        if (!username || !password || !email) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email address." });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        const existingUser = await Users.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: "Username already taken." });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ error: "Email already exists." });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");
        const user = new Users({
            username,
            email,
            password: hashedPassword, 
            role,
            isVerified: false,
            verificationToken: token 
        });

        await user.save();

        // Send a verification email link
        console.log(token, email);
        
        await sendVerificationEmail(email, token);

        res.status(201).json({ message: "Signup successfull.Please check your email for verification link.!" });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Something went wrong!" })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        if(!user.isVerified){
            return res.status(401).json({ error: "Please verify your account first." });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid creds" });
        }

        const payload = {
            id: user._id,
            role: user.role // Include the user's role in the payload
        }

        const accessToken = jwt.sign(
            payload,
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        refreshTokensStore.add(refreshToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
            sameSite: 'strict'
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600 * 1000, // 1 hour in milliseconds
            sameSite: 'strict',
        });

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Login error : ", error);
        res.status(500).json({ error: "Authentication failed" });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            refreshTokensStore.delete(refreshToken);
        }

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
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error: ", error);
        res.status(500).json({ error: "Failed to log out" });
    }
};


// user submit the email, if it exist and verified we generate the a reset token  and send a reset link 
const forgotPassword = async(req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if(!user || !user.isVerified){
            return res.status(400).json({ error : "User not found or not verified."});
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 1000 * 60 * 10;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;

        await user.save();

        await sendResetPasswordEmail(email, resetToken);

        res.status(200).json({ message: "Password reset link sent to the email."})

    } catch (error) {
        console.log("Forgot password error: ", error);
        res.status(500).json({ error: "Internal server error. "});
    }
}

module.exports = { login, signup, logout, forgotPassword };
