const express = require("express");
const router = express.Router();

const { getProduct, addProduct } = require("../controller/product.controller.js");

// Create data
router.get("/slider-advertis", getProduct);
router.post("/add", addProduct);

module.exports = router;
