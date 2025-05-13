import express from "express";
import Event from "../models/Events.js";
import Reservation from "../models/Reservation.js"; // Assuming you have a Reservation model
const router = express.Router();

// Create an event
router.post("/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: "Failed to create event", error });
  }
});

// Get all events
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error });
  }
});

// Get a single event by ID
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error });
  }
});

// Update an event
router.put("/events/:id", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event", error });
  }
});

// Delete an event
router.delete("/events/:id", async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    const deletedReservations = await Reservation.deleteMany({
      eventId: req.params.id,
    });
    if (deletedReservations.deletedCount > 0) {
      console.log(
        `Deleted ${deletedReservations.deletedCount} reservations for event ${req.params.id}`
      );
    }
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error });
  }
});

router.delete("/events", async (req, res) => {
  try {
    const deleted = await Event.deleteMany();
    if (!deleted) return res.status(404).json({ message: "No events found" });
    const deletedReservations = await Reservation.deleteMany();
    if (deletedReservations.deletedCount > 0) {
      console.log(
        `Deleted ${deletedReservations.deletedCount} reservations for all events`
      );
    }
    res.status(200).json({ message: "All events deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete events", error });
  }
});

export default router;
