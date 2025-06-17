import connectToDB from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { generateOtp } from "@/lib/generateOtp";
import { sendOtpMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { name, email, phone, password, role } = await req.json();
  await connectToDB();

  const otp = generateOtp();

  // Save OTP to DB
  await Otp.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  await sendOtpMail(email, otp);

  return NextResponse.json({ message: "OTP sent" });
}
