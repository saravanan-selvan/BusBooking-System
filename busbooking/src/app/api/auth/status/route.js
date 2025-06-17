import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return Response.json({ authenticated: false });
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return Response.json({ authenticated: true });
  } catch (err) {
    return Response.json({ authenticated: false });
  }
}
