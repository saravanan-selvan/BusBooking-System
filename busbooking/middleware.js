import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Define public routes that don't require authentication
const PUBLIC_PATHS = [
  "/",              // Login page
  "/signup",        // Signup page
  "/api/auth/login",    // Login API endpoint
  "/api/auth/signup",   // Signup API endpoint
  "/api/auth/status",   // Auth status check endpoint
  "/api/auth/logout",   // Logout endpoint
];

/**
 * Middleware function to handle authentication
 * @param {Request} request - The incoming request
 * @returns {NextResponse} - The response to send
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Log the current path for debugging
  console.log("🔒 Middleware checking path:", pathname);

  // Skip middleware for Next.js internal routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/styles')
  ) {
    return NextResponse.next();
  }

  // Check if the current path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || 
    pathname.startsWith(path + '/')
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    console.log("✅ Public path - allowing access:", pathname);
    return NextResponse.next();
  }

  // For all other paths, require authentication
  const token = request.cookies.get("token")?.value;

  // If no token exists, redirect to login page
  if (!token) {
    console.log("❌ No token found - redirecting to login from:", pathname);
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the JWT token
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    console.log("✅ Token verified - allowing access to:", pathname);
    return NextResponse.next();
  } catch (error) {
    console.log("❌ Invalid token - redirecting to login from:", pathname);
    // Clear the invalid token
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("token");
    return response;
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
