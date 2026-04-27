const eventModel = require("../models/eventModel");

// get all events
const getAllEvents = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const events = await eventModel.find(filter);
    if (!events) {
      return res.status(400).json({
        success: false,
        message: "events not found!!",
      });
    }

    return res.status(200).json({
      success: true,
      events,
      message: "events found!!",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in get all events api",
    });
  }
};

// get event by id
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params.id;
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(400).json({
        success: false,
        message: "event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
      message: "event found by id!!",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in get events by id api",
    });
  }
};

// create event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice,
      imageUrl,
    } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "please fill all fields!!",
      });
    }

    const event = await eventModel.create({
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice,
      imageUrl,
    });

    return res.status(200).json({
      success: true,
      event,
      message: "event created successfully!!",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "internal server error!! in create event api",
    });
  }
};

// update event
const updateEvent = async (req, res) => {};

// delete event
const deleteEvent = async (req, res) => {};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
