import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true }, // Consider using Date if appropriate
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String },
  price: { type: Number }, // Or Number if you'd rather enforce numeric value
  image: { type: String },
}, {
  timestamps: true,
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
