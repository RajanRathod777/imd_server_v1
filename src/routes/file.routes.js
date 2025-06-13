const express = require("express");
const router = express.Router();

const {
  uploadImages,
  uploadVideo,
  upload3DModel,
  showImages,
  showImageByName,
} = require("../controller/file.controller.js");

// upload route
router.post("/upload/images", uploadImages);
router.post("/upload/video", uploadVideo);
router.post("/upload/3d-model", upload3DModel);

// show & send route
router.get("/show/images/all", showImages);
router.get("/show/image/:image_name", showImageByName);

module.exports = router;
