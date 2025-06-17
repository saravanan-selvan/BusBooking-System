import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(req, { params }) {
  const { bookingId } = params;

  await dbConnect();

  try {
    const booking = await Booking.findById(bookingId).populate("busId");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: "Invalid booking ID or server error" }, { status: 500 });
  }
}
