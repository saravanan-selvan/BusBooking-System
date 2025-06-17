import connectToDB from "@/lib/mongodb";
import Otp from "@/models/Otp";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, otp, name, phone, password, role } = await req.json();

  await connectToDB();

  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord || otpRecord.otp !== otp) {
    return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: role || "user"
  });

  await Otp.deleteOne({ email }); // Cleanup

  return NextResponse.json({ message: "User registered successfully" });
}
