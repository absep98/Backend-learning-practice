const express = require("express");
const User = require("../Models/userModel")



const getAllUsers =  async (req, res) => {
    try {
        const searchName = req.query.name;
        const sortedNames = req.query.sort;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1)*limit;
        let query = User.find();
        if(searchName){
            query = query.where('name', new RegExp(searchName, 'i'));    
        }
        if(sortedNames){
            query = query.sort({ name : sortedNames === "asc" ? 1 : -1});
        }
        const users = await query.skip(skip).limit(limit);
        const total = await User.countDocuments();
        res.status(200).json({ data: users, page, limit, total });
    } catch (error) {
        next(error);
    }
};


const getUserById =  async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({ error : "User not found"})
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const createUser =  async (req, res) => {
    try {
        const { name } = req.body;
        const newUser = new User({ name });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res) => {
    try {
        const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {new : true});
        if(!newUser){
            return res.status(404).json({ error: "User not found"});
        }
        res.status(200).json(newUser);
    } catch (error) {
        next(error);
    }
};

const deleteUser =  async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({ error: "User not found, so can't delete!!"})
        }
        res.json({ message: "User deleted successfully."})
    } catch (error) {
        next(error);
    }
};



module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};