const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/validateEnv")();
const authRoutes = require("./routes/authRoutes");
const connectDB = require('./config/db');

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth", authRoutes)


app.use((req, res) => {
    res.status(404).send({
        success: false,
        error: "Not Found",
        message: `Can't find ${req.originalUrl} on this server`
    });
})

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

connectDB()
    .then(() => {
        console.log('✅ MongoDB connected');

        const PORT = process.env.PORT || 5001;

        app.listen(5001, () => {
            console.log('🚀 Server running on port 5000');
        });
    })
    .catch((err) => {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    });