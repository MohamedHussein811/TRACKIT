import mongoose from "mongoose";

const LoginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
  blockedUntil: { type: Date }
});

export const LoginAttempt = mongoose.model("LoginAttempt", LoginAttemptSchema);
