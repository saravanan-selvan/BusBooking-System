"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setIsLoggedIn(data.authenticated);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setIsLoggedIn(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const showNav = ["/home", "/about", "/user/yourbooking"].includes(pathname);

  return (
    <>
      <header style={{
        padding: "1rem",
        borderBottom: "1px solid #e9ecef",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#212529" }}>Echo Bus Booking</h1>

        {isLoggedIn && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button onClick={() => router.push("/Profile")} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <FaUserCircle size={28} color="#f9f9f9
" title="Profile" />
            </button>
            <FaSignOutAlt
              size={24}
              color="#dc3545"
              title="Logout"
              style={{ cursor: "pointer" }}
              onClick={handleLogout}
            />
          </div>
        )}
      </header>

      {showNav && isLoggedIn && (
        <nav style={{
          padding: "1rem",
          background: "#fff",
          borderBottom: "1px solid #e9ecef",
          display: "flex",
          justifyContent: "center",
          gap: "2rem"
        }}>
          <a href="/home" style={{
            color: pathname === "/home" ? "#007bff" : "#495057",
            textDecoration: "none",
            fontWeight: pathname === "/home" ? "600" : "400"
          }}>Home</a>
          <a href="/about" style={{
            color: pathname === "/about" ? "#007bff" : "#495057",
            textDecoration: "none",
            fontWeight: pathname === "/about" ? "600" : "400"
          }}>Map</a>
          <a href="/user/yourbooking" style={{
            color: pathname === "/user/yourbooking" ? "#007bff" : "#495057",
            textDecoration: "none",
            fontWeight: pathname === "/user/yourbooking" ? "600" : "400"
          }}>Your Booking</a>
        </nav>
      )}
    </>  
  );
}
