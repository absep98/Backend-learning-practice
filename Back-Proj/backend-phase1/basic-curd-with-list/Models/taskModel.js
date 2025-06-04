const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const taskModel = mongoose.model("Task", taskSchema);
module.exports = taskModel;