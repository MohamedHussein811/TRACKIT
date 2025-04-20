// routes/reservations.js
import express from 'express';
import Reservation from '../models/Reservation.js';
const router = express.Router();

// Book a reservation
router.post('/reservations', async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all reservations for an event
router.get('/reservations/event/:eventId', async (req, res) => {
  const reservations = await Reservation.find({ eventId: req.params.eventId });
  res.json(reservations);
});

// Optional: Get all reservations
router.get('/reservations', async (req, res) => {
  const reservations = await Reservation.find().populate('eventId');
  res.json(reservations);
});

export default router;
