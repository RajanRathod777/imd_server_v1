const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  bannerImage: String,
  variant: [
    {
      material: String,
      variant: [
        {
          color: String,
          sizes: [
            {
              size: String,
              maxQuantity: Number,
              quantity: Number,
              price: Number,
              video: String,
              model3D: String,
              img: [String],
            },
          ],
        },
      ],
    },
  ],
  categoryName: String,
  productName: String,
  productHeadingText: String,
  review: Number,
  slider: Number,
  star: Number,
  smallDescription: String,
  Description: String,
  totalSales: Number,
  advertisement: [
    {
      show: Boolean,
      no: Number,
    },
  ],
});

module.exports = mongoose.model("Products", productSchema);
