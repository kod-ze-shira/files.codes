const express = require("express");
const router = express.Router();
const path = require('path')
const filesController = require("../controller/files.js");
router.get('/:userName', (req, res) => {
    res.sendFile(path.join(__dirname, "../build/index.html"))
 })



module.exports = router;
