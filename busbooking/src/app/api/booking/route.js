import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Bus from "@/models/Bus";

export async function POST(request) {
  try {
    await connectToDB();
    const body = await request.json();
    const { busId, name, phone, email, gender, journeyDate, seats, totalAmount } = body;

    // Validate required fields
    if (!busId || !name || !phone || !gender || !journeyDate || !seats || !totalAmount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return NextResponse.json(
        { error: "Bus not found" },
        { status: 404 }
      );
    }

    // Check if seats are available
    const bookedSeats = bus.bookedSeats || [];
    const isSeatBooked = seats.some(seat => 
      bookedSeats.some(booking => booking.seat === seat)
    );

    if (isSeatBooked) {
      return NextResponse.json(
        { error: "One or more selected seats are already booked" },
        { status: 400 }
      );
    }

    // Create booking with pending status
    const booking = await Booking.create({
      busId,
      userInfo: {
        name,
        phone,
        email: email || "",
        gender
      },
      journeyDate,
      selectedSeats: seats,
      totalAmount,
      status: "pending" // Set status to pending initially
    });

    // Update bus with booked seats
    await Bus.findByIdAndUpdate(busId, {
      $push: {
        bookedSeats: seats.map(seat => ({
          seat,
          gender,
          journeyDate,
          status: "pending" // Mark seats as pending
        }))
      }
    });

    return NextResponse.json({ 
      bookingId: booking._id,
      message: "Booking initiated successfully" 
    });

  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to process booking" },
      { status: 500 }
    );
  }
} 