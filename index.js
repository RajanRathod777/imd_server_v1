require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/config/db");
const path = require("path");

// ✅ Start server
const PORT = process.env.PORT || 4444;
const app = express();
app.set('trust proxy', true);

// ✅ Apply core middlewares from one file
require("./src/middlewares/middlewares.js")(app);

// ✅ Connect Database
connectDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  });

app.use(express.static("public"));


// ✅ user profile routes
app.use("/v1/user", require("./src/routes/from.routes.js"));
// ✅ user verification routes
app.use("/v1/user/verify", require("./src/routes/verify.routes.js"));

// product routes
app.use("/api/v1/product", require("./src/routes/product.routes.js"));

// file routes
app.use("/api/v1/file", require("./src/routes/file.routes.js"));





app.get("/", (req, res) => {
  res.send("Hello from the server");
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
