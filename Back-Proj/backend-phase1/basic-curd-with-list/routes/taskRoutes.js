const express = require("express");
const router = express.Router();
const Task = require("../Models/taskModel");

router.post("/", async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.status(201).json({ message: "Task added succesfully..!"})
    } catch (error) {
        console.log(error);
    }
})


router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).json({ data : tasks})
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;