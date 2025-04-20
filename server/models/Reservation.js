// models/Reservation.js
import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  attendeeName: { type: String, required: true },
  attendeeEmail: { type: String, required: true },
  ticketType: { type: String, required: true }, // e.g. VIP, Standard, Early Bird
  price: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  nameOnCard: { type: String, default: "" }, // Optional, for payment processing
  cardNumber: { type: String, default: "" }, // Optional, for payment processing
  cardExpiry: { type: String, default: "" }, // Optional, for payment processing
  cardCVC: { type: String, default: "" }, // Optional, for payment processing


  
}, {
  timestamps: true,
});

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

export default Reservation;
