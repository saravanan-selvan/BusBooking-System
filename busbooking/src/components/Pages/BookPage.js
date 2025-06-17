"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookBusPage() {
  const { busId } = useParams();
  const router = useRouter();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [user, setUser] = useState({ name: "", phone: "", gender: "", journeyDate: "", email: ""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
    

  useEffect(() => {
    async function fetchBus() {
      try {
        setLoading(true);
        const res = await fetch(`/api/bus/${busId}`);
        if (!res.ok) throw new Error("Failed to fetch bus");
        const data = await res.json();
        setBus(data.bus);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (busId) fetchBus();
  }, [busId]);

  const toggleSeat = (seat) => {
    if (!bus?.bookedSeats) return;
    if (bus.bookedSeats.some((b) => b.seat === seat)) return;
    setSelectedSeats((s) =>
      s.includes(seat) ? s.filter((x) => x !== seat) : [...s, seat]
    );
  };

  const handleInput = (e) => setUser((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleBooking = async () => {
    try {
      setError("");
      if (!selectedSeats.length || !user.name || !user.phone || !user.gender || !user.journeyDate) {
        setError("Please fill all required fields");
        return;
      }

      const bookingData = {
        busId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        journeyDate: user.journeyDate,
        selectedSeats,
        totalAmount: bus.price * selectedSeats.length,
        status: "pending"
      };
      

      const res = await fetch("/api/booking/initiste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      if (data.bookingId) {
        router.push(`/booking-confirmation/${data.bookingId}`);
      } else {
        throw new Error("No booking ID received");
      }
    } catch (err) {
      setError(err.message || "Failed to process booking");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error || !bus) return <p>{error || "Bus not found"}</p>;

  const layoutType = bus.layout || "2+1";
  let seatsPerRow, seatPattern;

  if (layoutType === "2+1") {
    seatsPerRow = 3;
    seatPattern = [0, 1, 3];
  } else if (layoutType === "2+2") {
    seatsPerRow = 4;
    seatPattern = [0, 1, 2.5, 3.5];
  } else {
    seatsPerRow = 2;
    seatPattern = [0, 2];
  }

  const totalSeats = bus.totalSeats || 0;
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const booked = bus.bookedSeats || [];

  const svgWidth = 180;
  const seatSize = 30;
  const xGap = 10;
  const yGap = 15;

  return (
    <div className="page">
      <h1 className="title">{bus.busName} </h1>
      <h1 className="title"> {bus.busNumber}</h1>
      {/* Bus Info Section */}
      <section className="bus-info">
        <div className="info-row">
          <label>Route:</label>
          <span>{bus.start} → {bus.end}</span>
        </div>
        <div className="info-row">
          <label>Price per seat:</label>
          <span>₹{bus.price || "Price not specified"}</span>
        </div>
      </section>

      {/* Journey Date */}
      <section className="date-section">
        <label>Journey Date:</label>
        <input type="date" name="journeyDate" value={user.journeyDate} onChange={handleInput} />
      </section>

      {/* Seat Map Section */}
      <section className="seat-map">
        <h2>Select Seats</h2>
        <svg width={svgWidth} height={rows * (seatSize + yGap) + yGap}>
          {Array.from({ length: rows }).map((_, r) =>
            seatPattern.map((offset, i) => {
              const seatIndex = r * seatsPerRow + i;
              if (seatIndex >= totalSeats) return null;

              const x = offset * (seatSize + xGap);
              const y = r * (seatSize + yGap) + yGap;

              const seatNo = seatIndex + 1;
              const isBooked = booked.find((b) => b.seat === seatNo);
              const isSelected = selectedSeats.includes(seatNo);

              const fill = isBooked
                ? isBooked.gender === "male"
                  ? "#87cefa"
                  : isBooked.gender === "female"
                  ? "#f8c8dc"
                  : "#d0b0ff"
                : isSelected
                ? "#007bff"
                : "#d4edda";

              return (
                <g key={seatNo}>
                  <rect
                    x={x}
                    y={y}
                    width={seatSize}
                    height={seatSize}
                    rx="6"
                    fill={fill}
                    stroke="#555"
                    onClick={() => toggleSeat(seatNo)}
                    style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                  />
                  <text
                    x={x + seatSize / 2}
                    y={y + seatSize / 2 + 5}
                    textAnchor="middle"
                    fill="#333"
                    fontSize="14"
                    pointerEvents="none"
                  >
                    {seatNo}
                  </text>
                </g>
              );
            })
          )}
        </svg>
        <div className="legend">
          <span className="box available" /> Available
          <span className="box selected" /> Selected
          <span className="box male" /> Male
          <span className="box female" /> Female
          <span className="box other" /> Other
        </div>
      </section>

      {/* User Details Section */}
      <section className="user-details">
        <h2>Passenger Details</h2>
        <input name="name" placeholder="Name" value={user.name} onChange={handleInput} />
        <input name="phone" placeholder="Phone" value={user.phone} onChange={handleInput} />
        <select name="gender" value={user.gender} onChange={handleInput}>
          <option value="">Your Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleInput}
        />
      </section>

      {/* Booking Summary */}
      <section className="booking-summary">
        <h2>Booking Summary</h2>
        <div className="summary-row">
          <label>Selected Seats:</label>
          <span>{selectedSeats.join(", ") || "None"}</span>
        </div>
        <div className="summary-row">
          <label>Total Price:</label>
          <span>₹{bus.price * selectedSeats.length}</span>
        </div>
      </section>

      <button
        className="book-btn"
        disabled={!selectedSeats.length || !user.name || !user.phone || !user.gender || !user.journeyDate}
        onClick={handleBooking}
      >
        Book Now
      </button>

      <style jsx>{`
        .page {
          max-width: 400px;
          margin: 0 auto;
          padding: 1.5rem;
          font-family: sans-serif;
        }
        .title {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        section {
          margin-bottom: 1.5rem;
          background: #f9f9f9;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        .info-row, .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        label {
          font-weight: bold;
        }
        .date-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .date-section input {
          flex: 1;
        }
        svg {
          display: block;
          margin-left: 5px;
          margin: 2rem auto;
          border: 1px solid #ccc;
          background: #fdfdfd;
        }
        .legend {
          display: flex;
          justify-content: space-between;
          margin: 1rem 0;
          font-size: 0.9rem;
        }
        .box {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 4px;
          vertical-align: middle;
        }
        .box.available { background: #d4edda; border: 1px solid #a3d3b9; }
        .box.selected { background: #007bff; }
        .box.male { background: #87cefa; }
        .box.female { background: #f8c8dc; }
        .box.other { background: #d0b0ff; }
        input, select, button {
          display: block;
          width: 95%;
          margin: 4px;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .book-btn {
          background: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          padding: 12px;
          font-size: 1rem;
          border-radius: 6px;
          margin-top: 1rem;
        }
        .book-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .name{
        margin-right : 18px;
        }
 `}</style>
    </div>
  );
}