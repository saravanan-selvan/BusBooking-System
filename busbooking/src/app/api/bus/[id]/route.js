import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req, { params }) {
  await dbConnect();

  const { id } = params;

  try {
    const bus = await Bus.findById(id);
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }
    return NextResponse.json({ bus });
  } catch (error) {
    console.error("Error fetching bus:", error);
    return NextResponse.json({ error: "Error fetching bus" }, { status: 500 });
  }
}
