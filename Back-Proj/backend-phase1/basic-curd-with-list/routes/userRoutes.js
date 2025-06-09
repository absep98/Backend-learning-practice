const express = require("express");
const router = express.Router();
const validateUser = require("../middlewares/validateUser")

const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController")

router.get("/", getAllUsers);

router.get("/fail", (req, res, next) => {
    const error = new Error('Intential Failures');
    error.status = 418;
    next(error);
})

router.get("/:id", getUserById);

router.post("/", validateUser, createUser);

router.put("/:id", validateUser, updateUser)

router.delete("/:id", deleteUser);



module.exports = router;