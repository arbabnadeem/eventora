const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// const protect = async (req, res, next) => {
//   let token =
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer").split(" ")[1];
//   if (token) {
//     try {
//       const decode = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await userModel.findById(decode.id).select("-password");
//       if (!req.user) {
//         return res.status(400).json({
//           success: false,
//           message: "Not authorized, user not found",
//         });
//       }
//       next();
//     } catch (error) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Not authorized, token failed" });
//     }
//   } else {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded token:", decode);
    console.log("found user:", req.user); // 👈 add this

    req.user = await userModel.findById(decode.id).select("-password");

    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

const admin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
