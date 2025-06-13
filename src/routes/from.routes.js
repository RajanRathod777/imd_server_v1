const express = require("express");
const router = express.Router();

const {
  signupDataAdd,
  signupDataGet,
  signIn,
  updateProfile,
} = require("../controller/from.controller.js");

router.post("/signup", signupDataAdd);
router.get("/signup", signupDataGet);
router.post("/signin", signIn);
router.patch("/update-profile", updateProfile);

module.exports = router;
