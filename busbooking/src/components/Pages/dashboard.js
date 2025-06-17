"use client";

import { useEffect, useState } from "react";
import styles from "@/components/Styles/dashborad.module.css"; // ✅ corrected import

export default function AdminDashboard() {
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
      <h2>Admin Dashboard - All Buses</h2>

      <div className={styles["form-section"]}>
        <h3>Add New Bus</h3>
        <div className={styles["form-grid"]}>
          <input name="busNumber" value={newBus.busNumber} onChange={handleChange} placeholder="Bus Number" className={styles["form-input"]} />
          <input name="busName" value={newBus.busName} onChange={handleChange} placeholder="Bus Name" className={styles["form-input"]} />
          <input name="start" value={newBus.start} onChange={handleChange} placeholder="Start Location" className={styles["form-input"]} />
          <input name="end" value={newBus.end} onChange={handleChange} placeholder="End Location" className={styles["form-input"]} />
          <input name="startTime" value={newBus.startTime} onChange={handleChange} placeholder="Start Time" className={styles["form-input"]} />
          <input name="endTime" value={newBus.endTime} onChange={handleChange} placeholder="End Time" className={styles["form-input"]} />
          <input name="totalSeats" value={newBus.totalSeats} onChange={handleChange} placeholder="Total Seats" className={styles["form-input"]} />
          <input name="lowerSeats" value={newBus.lowerSeats} onChange={handleChange} placeholder="Lower Seats" className={styles["form-input"]} />
          <input name="upperSeats" value={newBus.upperSeats} onChange={handleChange} placeholder="Upper Seats" className={styles["form-input"]} />
          <select name="seatType" value={newBus.seatType} onChange={handleChange} className={styles["form-input"]}>
            <option value="seater">Seater</option>
            <option value="sleeper">Sleeper</option>
          </select>
          <select name="layout" value={newBus.layout} onChange={handleChange} className={styles["form-input"]}>
            <option value="2+1">2 + 1</option>
            <option value="2+2">2 + 2</option>
            <option value="1+1">1 + 1</option>
          </select>
          <input name="driverName" value={newBus.driverName} onChange={handleChange} placeholder="Driver Name" className={styles["form-input"]} />
          <input name="driverPhone" value={newBus.driverPhone} onChange={handleChange} placeholder="Driver Phone" className={styles["form-input"]} />
          <input name="price" value={newBus.price} onChange={handleChange} placeholder="Price" className={styles["form-input"]} />
        </div>
        <button onClick={handleAddBus} className={styles["add-button"]}>
          Add Bus
        </button>
      </div>

      <h3>Existing Buses</h3>
      <ul className={styles["bus-list"]}>
        {buses.map((bus, index) => (
          <li key={index} className={styles["bus-card"]}>
            <h4>{bus.busName} - {bus.busNumber}</h4>
            <p>Route: {bus.start} → {bus.end}</p>
            <p>Time: {bus.startTime} - {bus.endTime}</p>
            <p>Driver: {bus.driverName} ({bus.driverPhone})</p>
            <p>Seats: {bus.totalSeats}</p>
            <p>Lower Seats: {bus.lowerSeats}, Upper Seats: {bus.upperSeats}</p>
            <p>Seat Type: {bus.seatType}, Layout: {bus.layout}</p>
            <p>Price: ₹{bus.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
