const express = require("express");
const routes = express.Router();
const { registerUser } = require("../controllers/authController");

routes.post("/register", registerUser);
// routes.post("/login");
// routes.post("/verifyOtp");

module.exports = routes;
