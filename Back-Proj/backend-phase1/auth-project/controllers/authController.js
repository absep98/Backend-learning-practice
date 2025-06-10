const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");

const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";


const signup = async (req, res) => {
    try {
        const {username, password, role} = req.body;
        
        // Add input validation
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        const existingUser = await Users.findOne({ username });
        
        if(existingUser) {
            return res.status(400).json({ error: "Username already taken."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new Users({ username, password : hashedPassword, role });
        await user.save();
        res.status(201).json({ message: "User registered successfully..!" });
    } catch (error) {
        console.error("Signup error:", error); 
        res.status(500).json({error: "Something went wrong!"})
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        const user = await Users.findOne({username});

        if(!user) {
            return res.status(400).json({ error: "Invalid username or password."});
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({ error: "Invalid creds"});
        }

        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                role: user.role // Include the user's role in the token
            }, 
            SECRET_KEY, 
            { expiresIn: "1h"} 
        );
        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (error) {
        console.error("Login error : ", error);
        res.status(500).json({ error: "Authentication failed" });
    }
};

module.exports = { login , signup};