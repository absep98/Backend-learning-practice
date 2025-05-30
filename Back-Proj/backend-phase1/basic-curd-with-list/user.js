const express = require("express");
const app = express();
const router = express.Router();


let users = [
    { id: 1, name: "Alice"},
    { id: 2, name: "Bob"}
];

router.get("/", (req, res) => {
    res.json(users);
})

router.get("/:id", (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));
    if(!user) {
        return res.status(404).json({ error : "User not found"})
    }
    res.json(user);
})

router.post("/", (req, res) => {
    const {name} = req.body;
    const newUser = { id: Date.now(), name};
    users.push(newUser);
    res.status(201).json(newUser);
})

router.put("/:id", (req, res) => {
    const {name} = req.body;
    const userIndex = users.findIndex(u => u.id === Number(req.params.id));
    if(userIndex === -1){
        return res.status(404).json({ error: "User not found"})
    }
    users[userIndex] = {id: parseInt(req.params.id), name};
    res.json(users[userIndex]);
})

router.delete("/:id", (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));
    if(!user){
        res.status(404).status({ error: "User not found, so can't delete!!"})
    }
    users.splice(user, 1);
    res.json({ message: "User deleted successfully."})
})

module.exports = router;