import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  const { email, password } = await req.json();
  await dbConnect();

  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } 

  return NextResponse.json({ message: "Login successful", user }, { status: 200 });
}
