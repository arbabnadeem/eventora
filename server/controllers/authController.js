const { model } = require("mongoose");
const userModel = require("../models/userModel");

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
    const userExists = await userModel.find({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "user already exist!!",
      });
    }

    // createing user

    await userModel.create({
      name,
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "user register successfully!!",
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
