"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/Styles/dashborad.module.css";
import { FaBusAlt } from "react-icons/fa";


export default function AdminDashboard() {
  const router = useRouter();
  const [buses, setBuses] = useState([]);
  const [newBus, setNewBus] = useState({
    busNumber: "",
    busName: "",
    start: "",
    end: "",
    totalSeats: "",
    lowerSeats: "",
    upperSeats: "",
    seatType: "seater",
    layout: "2+1",
    driverName: "",
    driverPhone: "",
    startTime: "",
    endTime: "",
    price: ""
  });

  const handleDeleteBus = async (id) => {
    if (!confirm("Are you sure you want to delete this bus?")) return;

    try {
      const res = await fetch(`/api/admin/buses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBuses(prev => prev.filter(bus => bus._id !== id));
      } else {
        console.error("Failed to delete bus");
      }
    } catch (error) {
      console.error("Error deleting bus:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetch("/api/admin/buses")
      .then(res => res.json())
      .then(data => {
        setBuses(data.buses || []);
      });
  }, []);

  const handleChange = (e) => {
    setNewBus(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddBus = async () => {
    const res = await fetch("/api/admin/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBus)
    });

    if (res.ok) {
      const data = await res.json();
      setBuses(prev => [...prev, data.bus]);
      setNewBus({
        busNumber: "",
        busName: "",
        start: "",
        end: "",
        totalSeats: "",
        lowerSeats: "",
        upperSeats: "",
        seatType: "seater",
        layout: "2+1",
        driverName: "",
        driverPhone: "",
        startTime: "",
        endTime: "",
        price: ""
      });
    }
  };

  return (
    <div className={styles["dashboard-container"]}>
      <h2 className={styles["dashboard-heading"]}><FaBusAlt /> Admin Dashboard - Manage Your Buses</h2>

      <div className={styles["form-section"]}>
        <h3 className={styles["section-title"]}>➕ Add New Bus</h3>
        <div className={styles["form-grid"]}>
          {["busNumber", "busName", "start", "end", "startTime", "endTime", "totalSeats", "lowerSeats", "upperSeats", "driverName", "driverPhone", "price"].map(field => (
            <input
              key={field}
              name={field}
              value={newBus[field]}
              onChange={handleChange}
              placeholder={field.replace(/([A-Z])/g, ' $1')}
              className={styles["form-input"]}
            />
          ))}
          <select name="seatType" value={newBus.seatType} onChange={handleChange} className={styles["form-input"]}>
            <option value="seater">Seater</option>
            <option value="sleeper">Sleeper</option>
          </select>
          <select name="layout" value={newBus.layout} onChange={handleChange} className={styles["form-input"]}>
            <option value="1+2">1 + 2</option>
            <option value="2+2">2 + 2</option>
            <option value="1+1">1 + 1</option>
            <option value="2+3">2 + 3</option>
          </select>
        </div>
        <button onClick={handleAddBus} className={styles["add-button"]}>
          🚀 Add Bus
        </button>
      </div>

      <h3 className={styles["section-title"]}>🧾 Existing Buses</h3>
      <ul className={styles["bus-list"]}>
        {buses.map((bus, index) => (
          <li key={index} className={styles["bus-card"]}>
            <h4>{bus.busName} - {bus.busNumber}</h4>
            <p><strong>🛣️ Route:</strong> {bus.start} → {bus.end}</p>
            <p><strong>🕓 Time:</strong> {bus.startTime} - {bus.endTime}</p>
            <p><strong>👨‍✈️ Driver:</strong> {bus.driverName} ({bus.driverPhone})</p>
            <p><strong>💺 Seats:</strong> {bus.totalSeats} ({bus.seatType}, {bus.layout} layout)</p>
            <p><strong>⬇️ Lower:</strong> {bus.lowerSeats} &nbsp; <strong>⬆️ Upper:</strong> {bus.upperSeats}</p>
            <p><strong>💰 Price:</strong> ₹{bus.price}</p>
            <button className={styles["delete-button"]} onClick={() => handleDeleteBus(bus._id)}>
              🗑️ Delete
            </button>
            <button className={styles["delete-button"]}>Booking Details</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
