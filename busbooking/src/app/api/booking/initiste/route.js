import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const body = await req.json();
    await dbConnect();

    const newBooking = await Booking.create({
      busId: new mongoose.Types.ObjectId(body.busId),
      userInfo: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        gender: body.gender,
      },
      totalAmount: body.totalAmount, // ✅ use totalAmount from frontend
      journeyDate: body.journeyDate,
      selectedSeats: body.selectedSeats,
      status: "pending", // will change to "confirmed" after payment
    });

    return NextResponse.json({ success: true, bookingId: newBooking._id });
  } catch (err) {
    console.error("Booking error:", err); // ✅ Add this for debugging
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
