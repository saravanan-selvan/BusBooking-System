import { jwtVerify } from "jose";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function getUserFromToken(request) {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const user = await User.findById(payload.userId);
    return user;
  } catch {
    return null;
  }
}