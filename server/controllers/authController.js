const userModel = require("../models/userModel");
const otpModel = require("../models/otpModel");
const bcrypt = require("bcrypt");
const { sendOtpEmail } = require("../utils/email");

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

    // createing user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    // otp genarate and save to db
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
      message: "internal server error!!",
    });
  }
};

module.exports = { registerUser };
