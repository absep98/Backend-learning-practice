const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authenticateToken = require("../middleware/authMiddeware");


router.post(
    "/upload-profile",
    authenticateToken,
    upload.single("profileImage"),
    (req, res) => {
        if(!req.file){
            return res.status(400).json({ message: "No file uploaded"});
        }
        res.status(200).json({
            message: "File uploaded successfully",
            filename: req.file.filename,
            path: req.file.path
        });
    }
);

module.exports = router;