const bookingModel = require("../models/bookingModel");
const otpModel = require("../models/otpModel");
const eventModel = require("../models/eventModel");
const { sendBookingEmail, sendOtpEmail } = require("../utils/email");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// book your event route
const bookEvent = async (req, res) => {};

// send conformation otp to confirm your booking
const sendBookingOtp = async (req, res) => {
  try {
    const { user } = req.user;
    const otp = generateOtp();
    await otpModel.findByIdAndDelete({
      email: user.email,
      action: "event_booking",
    });
    await otpModel.create({ email: user.email, otp, action: "event_booking" });
    await sendOtpEmail(user.email, otp, "event_booking");

    return res.status(200).json({
      success: true,
      message: "otp send successfully for event booking",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in send Booking otp api",
    });
  }
};

// get your booked event
const getMyBooking = async (req, res) => {};

// admin confirm your booking
const confirmBooking = async (req, res) => {};

// you can cancel your booking
const cancelBooking = async (req, res) => {};

module.exports = {
  bookEvent,
  sendBookingOtp,
  getMyBooking,
  confirmBooking,
  cancelBooking,
};
