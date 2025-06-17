"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookBusPage() {
  const params = useParams();
  const router = useRouter();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [user, setUser] = useState({ 
    name: "", 
    phone: "", 
    gender: "", 
    journeyDate: "", 
    email: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBus() {
      try {
        setLoading(true);
        setError("");
        
        const busId = params.busId;
        if (!busId) {
          throw new Error("Bus ID is required");
        }

        console.log("Fetching bus with ID:", busId);
        const res = await fetch(`/api/bus/${busId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch bus");
        }

        if (!data.bus) {
          throw new Error("Bus data not found");
        }

        console.log("Bus data received:", data.bus);
        setBus(data.bus);
      } catch (e) {
        console.error("Error fetching bus:", e);
        setError(e.message || "Failed to fetch bus details");
      } finally {
        setLoading(false);
      }
    }

    if (params.busId) {
      fetchBus();
    }
  }, [params.busId]);

  const toggleSeat = (seat) => {
    if (!bus?.bookedSeats || !user.journeyDate) return;
    
    const isBooked = bus.bookedSeats.some(booking => 
      booking.seat === seat && 
      booking.status === "confirmed" &&
      new Date(booking.journeyDate).toDateString() === new Date(user.journeyDate).toDateString()
    );

    if (isBooked) {
      console.log("Seat is booked for this date:", seat);
      return;
    }
    
    setSelectedSeats(prev => 
      prev.includes(seat) ? prev.filter(x => x !== seat) : [...prev, seat]
    );
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    
    if (name === 'journeyDate') {
      setSelectedSeats([]);
    }
  };

  const handleBooking = async () => {
    try {
      setError("");
      if (!selectedSeats.length || !user.name || !user.phone || !user.gender || !user.journeyDate) {
        setError("Please fill all required fields");
        return;
      }

      const bookingData = {
        busId: params.busId,
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
      console.error("Booking error:", err);
      setError(err.message || "Failed to process booking");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading bus details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => router.back()} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="error-container">
        <div className="error">Bus not found</div>
        <button onClick={() => router.back()} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

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
  const svgWidth = 180;
  const seatSize = 30;
  const xGap = 10;
  const yGap = 15;

  return (
    <div className="page">
      <h1 className="title">{bus.busName} - {bus.busNumber}</h1>
      
      <section className="bus-info">
        <div className="info-row">
          <label>Route:</label>
          <span>{bus.start} → {bus.end}</span>
        </div>
        <div className="info-row">
          <label>Price per seat:</label>
          <span>₹{bus.price}</span>
        </div>
        <div className="info-row">
          <label>Departure:</label>
          <span>{bus.startTime}</span>
        </div>
        <div className="info-row">
          <label>Arrival:</label>
          <span>{bus.endTime}</span>
        </div>
      </section>

      <section className="date-section">
        <label>Select Journey Date:</label>
        <input 
          type="date" 
          name="journeyDate" 
          value={user.journeyDate} 
          onChange={handleInput}
          min={new Date().toISOString().split('T')[0]}
        />
      </section>

      <section className="seat-map">
        <h2>Select Seats</h2>
        {!user.journeyDate && (
          <div className="warning">Please select a journey date first</div>
        )}
        <svg width={svgWidth} height={rows * (seatSize + yGap) + yGap}>
          {Array.from({ length: rows }).map((_, r) =>
            seatPattern.map((offset, i) => {
              const seatIndex = r * seatsPerRow + i;
              if (seatIndex >= totalSeats) return null;

              const x = offset * (seatSize + xGap);
              const y = r * (seatSize + yGap) + yGap;

              const seatNo = seatIndex + 1;
              const bookedSeat = bus.bookedSeats?.find(b => 
                b.seat === seatNo && 
                b.status === "confirmed" &&
                new Date(b.journeyDate).toDateString() === new Date(user.journeyDate).toDateString()
              );
              const isBooked = bookedSeat?.status === "confirmed";
              const isSelected = selectedSeats.includes(seatNo);

              let fill = "#d4edda"; // Available
              if (isBooked) {
                fill = bookedSeat.gender === "male" 
                  ? "#87cefa"  // Male
                  : bookedSeat.gender === "female"
                  ? "#f8c8dc"  // Female
                  : "#d0b0ff"; // Other
              } else if (isSelected) {
                fill = "#007bff"; // Selected
              }

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
                    style={{ 
                      cursor: !user.journeyDate || isBooked ? "not-allowed" : "pointer",
                      opacity: isBooked ? 0.8 : 1
                    }}
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
          <span className="box male" /> Male (Confirmed)
          <span className="box female" /> Female (Confirmed)
          <span className="box other" /> Other (Confirmed)
        </div>
      </section>

      <section className="user-details">
        <h2>Passenger Details</h2>
        <input 
          name="name" 
          placeholder="Full Name" 
          value={user.name} 
          onChange={handleInput}
          required 
        />
        <input 
          name="phone" 
          placeholder="Phone Number" 
          value={user.phone} 
          onChange={handleInput}
          pattern="[0-9]{10}"
          required 
        />
        <select 
          name="gender" 
          value={user.gender} 
          onChange={handleInput}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          name="email"
          type="email"
          placeholder="Email (Optional)"
          value={user.email}
          onChange={handleInput}
        />
      </section>

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
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .bus-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }
        .date-section {
          margin: 20px 0;
        }
        .date-section input {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
        }
        .seat-map {
          margin: 20px 0;
          text-align: center;
        }
        .warning {
          color: #dc3545;
          margin: 10px 0;
          padding: 10px;
          background: #f8d7da;
          border-radius: 4px;
        }
        .legend {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .box {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 5px;
          border-radius: 4px;
        }
        .available { background: #d4edda; }
        .selected { background: #007bff; }
        .male { background: #87cefa; }
        .female { background: #f8c8dc; }
        .other { background: #d0b0ff; }
        .user-details {
          margin: 20px 0;
        }
        .user-details input,
        .user-details select {
          width: 100%;
          padding: 10px;
          margin: 8px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .booking-summary {
          background: #e9ecef;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }
        .book-btn {
          width: 100%;
          padding: 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .book-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          padding: 20px;
        }
        .loading {
          text-align: center;
          padding: 20px;
          font-size: 18px;
          color: #666;
        }
        .error {
          text-align: center;
          padding: 20px;
          color: #dc3545;
          background: #f8d7da;
          border-radius: 4px;
          margin: 20px 0;
        }
        .back-btn {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .back-btn:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
} 