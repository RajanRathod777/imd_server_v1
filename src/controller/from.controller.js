const bcrypt = require("bcrypt");
const Data = require("../schemas/user.schema");

// ✅ Signup
const signupDataAdd = async (req, res) => {
  try {
    const body = req.body;
    console.log("Received signupDataAdd Controller data:", body);

    const { email, password } = body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password (minimum 6 characters)",
      });
    }

    const existingUser = await Data.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new Data({
      ...body,
      password: hashedPassword,
    });

    const savedData = await newUser.save();

    res.status(201).json({
      success: true,
      userInfo: {
        token: savedData._id,
        email: savedData.email,
      },
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({
      success: false,
      message: "Server technical problem",
      error: err.message,
    });
  }
};

// ✅ Get All Users
const signupDataGet = async (req, res) => {
  try {
    const data = await Data.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// ✅ Sign In
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await Data.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    if (existingUser.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or blocked",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    const userRemoveIdPass = existingUser.toObject();
    delete userRemoveIdPass.password;
    delete userRemoveIdPass._id;

    return res.status(200).json({
      success: true,
      message: "Sign-in successful",
      userInfo: {
        token: existingUser._id,
        ...userRemoveIdPass,
      },
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res.status(500).json({
      success: false,
      message: "Server technical problem",
    });
  }
};

// ✅ Update Profile
const updateProfile = async (req, res) => {
  try {
    const body = req.body;
    const { email } = body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to update profile",
      });
    }

    const updateFields = {
      image: body.image,
      username: body.username,
      country: body.country,
      state: body.state,
      city: body.city,
      phoneCode: body.phoneCode,
      phone: body.phone,
      address: body.address,
      pincode: body.pincode,
    };

    const updateResult = await Data.updateOne(
      { email },
      { $set: updateFields }
    );

    if (updateResult.modifiedCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No changes made or update failed",
      });
    }
  } catch (error) {
    console.error("Error during updateProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server encountered a technical problem",
    });
  }
};

module.exports = {
  signupDataAdd,
  signupDataGet,
  signIn,
  updateProfile,
};
