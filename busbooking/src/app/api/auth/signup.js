// pages/api/auth/signup.js

import connectToDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, password, phone, role } = req.body;

  try {
    await connectToDB(); 

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password, phone, role });
    await newUser.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: 'Server error' });
  }
}
