// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
  userInfo: {
    name: String,
    phone: String,
    email: String,
    gender: String,
  },
  journeyDate: Date,
  totalAmount: Number, 
  selectedSeats: [Number],
  status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
  paymentId: String,
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
