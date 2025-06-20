"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/Styles/userAvailablebus.module.css"; // Adjust path as needed

export default function HomePage() {
  const router = useRouter();
  const [buses, setBuses] = useState([]);

  // 🔐 Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  // 🚍 Fetch buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch("/api/admin/buses"); // Change endpoint if needed
        const data = await res.json();
        setBuses(data.buses || []);
      } catch (error) {
        console.error("Failed to load buses:", error);
      }
    };

    fetchBuses();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.heading}>Available Buses</h2>
      {buses.length === 0 ? (
        <p>No buses available.</p>
      ) : (
        <ul className={styles.busList}>
          {buses.map((bus, index) => (
            <li key={index} className={styles.busCard}>
              <h4 className={styles.busTitle}>
                🚌 {bus.busName} - {bus.busNumber}
              </h4>
              <p className={styles.busInfo}>
                <span className={styles.busIcon}>🗺️</span>
                Route: {bus.start} → {bus.end}
              </p>
              <p className={styles.busInfo}>
                <span className={styles.busIcon}>⏰</span>
                Time: {bus.startTime} - {bus.endTime}
              </p>
              <p className={styles.busInfo}>
                <span className={styles.busIcon}>👨‍✈️</span>
                Driver: {bus.driverName} ({bus.driverPhone})
              </p>
              <p className={styles.busInfo}>
                <span className={styles.busIcon}>💺</span>
                Seats: <span className={styles.seatsBadge}>{bus.totalSeats}</span>
              </p>
              <p className={styles.busInfo}>
                <span className={styles.busIcon}>💰</span>
                Price: {bus.price}</p>
              <button
                onClick={() => router.push(`/user/booking/${bus._id}`)}
                className={styles.bookButton}
              >
                Book Now
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
