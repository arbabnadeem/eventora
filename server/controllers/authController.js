const userModel = require("../models/userModel");
const otpModel = require("../models/otpModel");
const bcrypt = require("bcrypt");
const { sendOtpEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");

const generateToken = async (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "5d" });
};

// register api
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // empty field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "please fill all the fields!!",
      });
    }

    // user exist validation
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "user already exist!!",
      });
    }

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    // otp generate and save to db
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await otpModel.create({ email, otp, action: "account_verification" });
    await sendOtpEmail(email, otp, "account_verification");

    return res.status(200).json({
      success: true,
      message: "user register successfully!!, please check you email for otp",
      email: user.email,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in register api",
    });
  }
};

// login api
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // finding user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "invalid credentials",
      });
    }

    // matching the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "invalid credentials",
      });
    }

    // generating a new otp if user is not verify
    if (!user.isVerified && user.role === "user") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await otpModel.deleteMany({ email, action: "account_verification" });
      await otpModel.create({ email, otp, action: "account_verification" });
      await sendOtpEmail(email, otp, "account_verification");
      return res.status(400).json({
        message: "account not verified!! please check your email for otp",
      });
    }

    return res.status(200).json({
      success: true,
      message: "login successfully",
      user,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in login api",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // finding otp in db with validation
    const otpRecord = await otpModel.findOne({
      email,
      otp,
      action: "account_verification",
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "invalid or expired otp",
      });
    }

    // updating the user is verified
    const user = await userModel.findByIdAndUpdate(
      { email },
      { isVerified: true },
    );
    await otpModel.deleteMany({ email, action: "account_verification" }); // delete all otp

    return res.status(200).json({
      success: true,
      user,
      message: "user is verified by otp",
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in login api",
    });
  }
};

module.exports = { registerUser, loginUser, verifyOtp };
