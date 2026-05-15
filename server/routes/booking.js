const express = require("express");
const routes = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  bookEvent,
  sendBookingOtp,
  getMyBooking,
  confirmBooking,
  cancelBooking,
  getAllBookings,
} = require("../controllers/bookingController");

// book your event route
routes.post("/", protect, bookEvent);

// send conformation otp to confirm your booking
routes.post("/send-otp", protect, sendBookingOtp);

// get your booked event
routes.get("/my", protect, getMyBooking);

// admin get all bookings
routes.get("/all", protect, admin, getAllBookings);

// admin confirm your booking
routes.put("/:id/confirm", protect, admin, confirmBooking);

// you can cancel your booking
routes.delete("/:id", protect, cancelBooking);

module.exports = routes;
