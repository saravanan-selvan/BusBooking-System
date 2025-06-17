// src/app/api/profile/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/auth";
import connectToDB from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";

export async function GET(request) {
  try {
    await connectToDB();
    const user = await getUserFromToken(request.cookies.get("token")?.value);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await User.findById(user.id).select("-password");
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bookings = await Booking.find({ user: user.id })
      .populate('bus', 'busNumber busName route')
      .sort({ journeyDate: -1 });

    return NextResponse.json({ 
      user: userData, 
      bookings: bookings.map(booking => ({
        ...booking.toObject(),
        journeyDate: booking.journeyDate.toISOString(),
        bookingDate: booking.bookingDate.toISOString()
      }))
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectToDB();
    const user = await getUserFromToken(request.cookies.get("token")?.value);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { phone, address } = await request.json();
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { phone, address },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
  }

  