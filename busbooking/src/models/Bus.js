import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  busName: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  price: { type: Number, required: true },
  lowerSeats: { type: Number, default: 20 },
  upperSeats: { type: Number, default: 20 },
  seatType: { type: String, enum: ['seater', 'sleeper'], default: 'seater' },
  layout: { type: String, enum: ['2+1', '2+2', '1+1'], default: '2+1' },
  bookedSeats: [
    {
      seat: Number,
      gender: String,
      journeyDate: String,
      name : String,
    }
  ], // 👈 added field
}, { timestamps: true });

export default mongoose.models.Bus || mongoose.model("Bus", BusSchema);
