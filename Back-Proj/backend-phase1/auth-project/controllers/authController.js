const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");

const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

const { refreshTokensStore } = require("../utils/tokenStore");

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

        const user = new Users({ username, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: "User registered successfully..!" });
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
            secure: false,
            maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
            sameSite: 'strict'
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
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

module.exports = { login, signup };