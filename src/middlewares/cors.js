const cors = require("cors");




// CORS middleware configuration
const corsMiddleware = cors();

// const corsMiddleware = cors({
//   origin: "*", // ✅ Allow all origins
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: false, // ❌ Must be false if origin is '*'
// });


// const allowedOrigins = ["http://localhost:3000", "https://myapp.com", "*"];


// const corsMiddleware = cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// });

module.exports = corsMiddleware;
