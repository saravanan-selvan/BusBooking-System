import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectToDB from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    await connectToDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      const response = NextResponse.json({
        message: "Login successful",
        role: user.role // return role to client
      });
      

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      secure: true,
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
