const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./config/validateEnv")();
const authRoutes = require("./routes/authRoutes");
const connectDB = require('./config/db');
const uploadRoutes = require("./routes/uploadRoutes");
const app = express();

//middlewares
app.use(express.json());
app.use(cors());
/*
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
*/
app.use(cookieParser());
app.use(helmet());
//routes
app.use("/api/auth", authRoutes);
app.use("/uploads", uploadRoutes);
app.use("/uploads", express.static("uploads"));

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

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    });