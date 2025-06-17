// lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
