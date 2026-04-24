const express = require("express");
const routes = express.Router();
const {
  registerUser,
  loginUser,
  verifyOtp,
} = require("../controllers/authController");

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/verifyOtp", verifyOtp);

module.exports = routes;
