import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Bus from "@/models/Bus";
import { verifyToken } from "@/lib/auth"; // 🔐 Assumes you have a JWT verification utility

// GET /api/admin/buses — fetch only admin's buses
export async function GET(req) {
  try {
    await connectToDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buses = await Bus.find({ adminId: user._id });
    return NextResponse.json({ buses });
  } catch (err) {
    console.error("GET /api/admin/buses error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST /api/admin/buses — create new bus with adminId
export async function POST(req) {
  try {
    await connectToDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const bus = await Bus.create({ ...body, adminId: user._id });

    return NextResponse.json({ bus });
  } catch (err) {
    console.error("POST /api/admin/buses error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
