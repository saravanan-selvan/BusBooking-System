import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Bus from "@/models/Bus";
import { verifyToken } from "@/lib/auth"; // You should have a helper to verify JWT token

export async function GET(req) {
  await connectToDB();
  const buses = await Bus.find({});
  return NextResponse.json({ buses });
}

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const body = await req.json();
    const bus = await Bus.create(body);
    return NextResponse.json({ bus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
