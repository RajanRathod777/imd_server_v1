const express = require("express");
const router = express.Router();

const { SignupEmailVerify, ProfileEmailVerify } = require("../controller/verify.controller.js");

// Routes
router.post("/signup", SignupEmailVerify);
router.post("/profile", ProfileEmailVerify);

module.exports = router;
