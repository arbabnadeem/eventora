const bookingModel = require("../models/bookingModel");
const otpModel = require("../models/otpModel");
const userModel = require("../models/userModel"); // add this line at the top
const eventModel = require("../models/eventModel");
const { sendBookingEmail, sendOtpEmail } = require("../utils/email");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// send conformation otp to confirm your booking
const sendBookingOtp = async (req, res) => {
  try {
    const user = req.user;
    const otp = generateOtp();
    await otpModel.findOneAndDelete({
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

// book your event route
const bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    // Verify OTP explicitly before proceeding
    const otpRecord = await otpModel.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP for booking",
      });
    }

    // finding event by id
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(400).json({
        success: false,
        message: "event not found",
      });
    }
    if (event.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: "no seats is available",
      });
    }

    // checking if user is already booked or not
    const existingBooking = await bookingModel.findOne({
      userId: req.user.id,
      eventId,
    });
    if (existingBooking && existingBooking.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Already booked or pending",
      });
    }

    // creating booking
    const booking = await bookingModel.create({
      userId: req.user._id,
      eventId,
      status: "pending",
      paymentStatus: "not_paid",
      amount: event.ticketPrice,
    });

    // deleting otp after verifying
    await otpModel.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });

    return res.status(200).json({
      success: true,
      booking,
      message: "Booking request submitted",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in book event api",
    });
  }
};

// admin confirm your booking
const confirmBooking = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    // validation for payment status
    if (!["paid", "not_paid"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "invalid payment status!!",
      });
    }

    // searching for booking with id
    const booking = await bookingModel
      .findById(req.params.id)
      .populate("eventId")
      .populate("userId", "name email");
    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "booking not found!!",
      });
    }

    // if it is already confirmed then return for here
    if (booking.status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking is already confirmed",
      });
    }

    // finding event with event id
    const event = await eventModel.findById(booking.eventId._id);
    if (event.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: "no seat available for this event!!",
      });
    }

    // updating the booking status
    booking.status = "confirmed";
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    await booking.save();

    // updating the available seat
    event.availableSeats -= 1;
    await event.save();

    // sending confirmation email
    await sendBookingEmail(booking.userId.email, event.title, booking._id);

    return res.status(200).json({
      success: true,
      booking,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in confirm booking api",
    });
  }
};

// get your booked event
const getMyBooking = async (req, res) => {
  try {
    const user = req.user;

    const booking = await bookingModel
      .find({ userId: user._id })
      .populate("eventId");

    return res.status(200).json({
      success: true,
      booking,
      message: "booking get successfully!!",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in get my booking api",
    });
  }
};

// get all bookings
const getAllBookings = async (req, res) => {
  console.log("req.user:", req.user);
  try {
    const bookings = await bookingModel
      .find()
      .populate("eventId")
      .populate("userId", "name email"); // so admin can see user details

    return res.status(200).json({
      success: true,
      booking: bookings,
      message: "All bookings fetched successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "Internal server error in get all bookings",
    });
  }
};

// you can cancel your booking
const cancelBooking = async (req, res) => {
  try {
    // finding booking bt id
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "booking not found",
      });
    }

    // checking if the booking userid is same as req.user.id
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "unauthorized",
      });
    }

    // checking booking is already cancelled or not
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "your booking is already cancelled",
      });
    }

    // boolean property for booking status
    const wasCancelled = booking.status === "confirmed";

    // updating the booking status
    booking.status = "cancelled";
    await booking.save();

    // updating the event available seats
    if (wasCancelled) {
      const event = await eventModel.findById(booking.eventId);
      if (event) {
        event.availableSeats += 1;
        await event.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "booking cancelled successfully!!",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in cancel booking api",
    });
  }
};

module.exports = {
  bookEvent,
  sendBookingOtp,
  getMyBooking,
  confirmBooking,
  cancelBooking,
  getAllBookings,
};
