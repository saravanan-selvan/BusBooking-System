import connectToDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password, phone, role } = await req.json();

    // === Validation Logic ===

    // Name: only letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name || !nameRegex.test(name)) {
      return new Response(JSON.stringify({ message: 'Name should contain only letters and spaces' }), {
        status: 400,
      });
    }

    // Phone: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return new Response(JSON.stringify({ message: 'Phone number must be 10 digits' }), {
        status: 400,
      });
    }

    // Email: basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: 'Invalid email format' }), {
        status: 400,
      });
    }

    // Password: at least 6 characters
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ message: 'Password must be at least 6 characters' }), {
        status: 400,
      });
    }

    await connectToDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user',
    });

    await newUser.save();

    return new Response(JSON.stringify({ message: 'User created successfully' }), {
      status: 201,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
