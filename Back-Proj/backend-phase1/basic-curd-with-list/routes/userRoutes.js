const express = require("express");
const router = express.Router();
const User = require("../Models/userModel")
const { v4: uuidv4} = require("uuid");
const fs = require("fs");
const Joi = require("joi");
const validateUser = require("../middlewares/validateUser")
const { log, error } = require("console");


router.get("/", async (req, res) => {
    try {
        let result = await User.find();
        const searchName = req.query.name;
        const sortedNames = req.query.sort;
        if(searchName){
            result = result.filter(user => user.name.toLowerCase().includes(searchName.toLocaleLowerCase()));
        }
        if(sortedNames){
            result = result.slice().sort((a, b) =>
                sortedNames === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name)
            );
        }
        res.status(200).json({ data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch all user's data."})
    }
})

router.get("/fail", (req, res, next) => {
    const error = new Error('Intential Failures');
    error.status = 418;
    next(error);
})

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({ error : "User not found"})
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch this user's data."})
    }
})

router.post("/", validateUser, async (req, res) => {
    try {
        const { name } = req.body;
        const newUser = new User({ name });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to create new user."})
    }
})

router.put("/:id", validateUser, async (req, res) => {
    try {
        const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {new : true});
        if(!newUser){
            return res.status(404).json({ error: "User not found"});
        }
        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to update the data."})
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({ error: "User not found, so can't delete!!"})
        }
        res.json({ message: "User deleted successfully."})
    } catch (error) {
        res.status(500).json({error : "Internal Server Error"});
    }
});



module.exports = router;