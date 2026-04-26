const express = require("express");
const routes = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {} = require("../controllers/eventController");

// get all event
routes.get("/", getAllEvents);

// get event by id
routes.get("/:id", getEventById);

// create event
routes.post("/", protect, admin, createEvent);

// update event
routes.put("/:id", protect, admin, updateEvent);

// delete event
routes.delete("/:id", protect, admin, deleteEvent);

module.exports = routes;
