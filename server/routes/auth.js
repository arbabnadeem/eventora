const express = require("express");
const routes = express.Router();
const {
  registerUser,
  loginUser,
  verifyOtp,
} = require("../controllers/authController");

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/verify-otp", verifyOtp);

module.exports = routes;
