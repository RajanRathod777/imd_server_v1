const { v4: uuidv4 } = require("uuid");

// GET Product by ID (simple version)
const getProduct = async (req, res) => {
  try {
    // const id = req.params.id; // Assuming the ID is passed as a URL parameter
    return res.status(200).json({
      success: true,
      data: "Product found"});
  } catch (error) {
    if (error.notFound) {
      // LevelDB throws error with notFound flag when key is missing
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ADD Product (simple version)
const addProduct = async (req, res) => {
  try {
    // const { name, price, description } = req.body;
    return res.status(201).json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { getProduct, addProduct };
