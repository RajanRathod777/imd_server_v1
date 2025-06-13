const { Worker } = require("worker_threads");
const path = require("path");
const Data = require("../schemas/user.schema.js");

const MAX_WORKERS = 5;
const activeWorkers = new Set();
const workerQueue = [];

// Worker runner
function runWorker(data) {
  return new Promise((resolve, reject) => {
    const startWorker = () => {
      const worker = new Worker(
        path.join(__dirname, "../workers/otpWorker.js"),
        { workerData: data }
      );

      activeWorkers.add(worker);

      const cleanup = () => {
        activeWorkers.delete(worker);
        if (workerQueue.length > 0) {
          const next = workerQueue.shift();
          next();
        }
      };

      worker.once("message", (result) => {
        cleanup();
        resolve(result);
      });

      worker.once("error", (err) => {
        cleanup();
        reject(err);
      });

      worker.once("exit", (code) => {
        if (code !== 0) console.warn(`Worker exited with code ${code}`);
        cleanup();
      });
    };

    if (activeWorkers.size < MAX_WORKERS) {
      startWorker();
    } else {
      workerQueue.push(startWorker);
    }
  });
}

// Email format validator
const isValidEmail = (email) => {
  return (
    typeof email === "string" &&
    email.length <= 200 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
};

// ✅ Signup Email Verify
const SignupEmailVerify = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Signup verify email =", email);

    if (!isValidEmail(email)) {
      return res.status(409).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existingEmail = await Data.findOne({ email });
    if (existingEmail) {
      console.error("Email already registered:", email);
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const result = await runWorker({ email });

    if (!result.success) {
      console.error("OTP Worker Error:", result.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP: " + result.error,
      });
    }

    return res.status(201).json({
      success: true,
      otp: result.otp,
    });
  } catch (error) {
    console.error("Signup email verify controller error =", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Profile Email Verify
const ProfileEmailVerify = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Profile verify email =", email);

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existingEmail = await Data.findOne({ email });

    if (!existingEmail) {
      console.error("Email not found:", email);
      return res.status(409).json({
        success: false,
        message: "Email not found",
      });
    }

    if (existingEmail.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or blocked",
      });
    }

    const result = await runWorker({ email });

    if (!result.success) {
      console.error("OTP Worker Error:", result.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP: " + result.error,
      });
    }

    console.log("Profile verify OTP = ", result.otp);

    return res.status(201).json({
      success: true,
      otp: result.otp,
    });
  } catch (error) {
    console.error("Profile email verify controller error =", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  SignupEmailVerify,
  ProfileEmailVerify,
};
