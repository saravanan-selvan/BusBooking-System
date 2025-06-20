import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Bus from "@/models/Bus";


export async function DELETE(req, { params }) {
    await connectToDB();
    const { id } = params;
  
    try {
      await Bus.findByIdAndDelete(id);
      return NextResponse.json({ message: "Bus deleted successfully" });
    } catch (error) {
      return NextResponse.json({ error: "Failed to delete bus" }, { status: 500 });
    }
  }