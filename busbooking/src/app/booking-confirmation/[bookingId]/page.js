'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaUser, FaBus, FaChair, FaRupeeSign,
  FaCheckCircle, FaCalendarAlt, FaTicketAlt
} from "react-icons/fa";

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    try {
      const res = await fetch("/api/booking/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/pdf")) {
        throw new Error("Invalid response format");
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EchoBusBooking-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("PDF downloaded successfully!");
    } catch (err) {
      console.error("Error generating/downloading PDF:", err);
      alert(err.message || "Failed to generate or download PDF");
    }
  };

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/booking/${bookingId}`);
        const data = await res.json();
        if (res.ok) setBooking(data.booking);
        else setError(data.error || "Failed to fetch booking");
      } catch (err) {
        setError("Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) fetchBooking();
  }, [bookingId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!booking) return <p>Booking not found</p>;

  const {
    userInfo: { name, phone, email, gender } = {},
    journeyDate,
    selectedSeats = [],
    busId,
    totalAmount,
  } = booking;

  return (
    <div className="confirmation-bg">
      <div className="confirmation-header">
        <FaBus className="bus-logo" />
        <span className="brand">EchoBus</span>
      </div>
      <div className="ticket animate-pop">
        <div className="ticket-header">
          <FaCheckCircle className="checkmark" />
          <h1>Booking Confirmed</h1>
          <span className="ticket-id">
            <FaTicketAlt /> #{bookingId}
          </span>
        </div>
        <div className="divider">
          <span><FaUser /> Passenger</span>
        </div>
        <div className="ticket-row">
          <div>
            <strong>Name</strong>
            <div>{name || "N/A"}</div>
          </div>
          <div>
            <strong>Gender</strong>
            <div>{gender || "N/A"}</div>
          </div>
        </div>
        <div className="ticket-row">
          <div>
            <strong>Phone</strong>
            <div>{phone || "N/A"}</div>
          </div>
          <div>
            <strong>Email</strong>
            <div>{email || "N/A"}</div>
          </div>
        </div>
        <div className="divider">
          <span><FaBus /> Bus & Route</span>
        </div>
        <div className="ticket-row route-row">
          <div>
            <strong>Bus</strong>
            <div>{busId?.busName || "N/A"} ({busId?.busNumber || "N/A"})</div>
          </div>
          <div>
            <strong>Date</strong>
            <div>
              <FaCalendarAlt className="icon-cal" />
              {journeyDate ? new Date(journeyDate).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </div>
        <div className="route-visual">
          <span className="dot start"></span>
          <span className="route-label">{busId?.start || "N/A"}</span>
          <span className="route-line"></span>
          <span className="route-label">{busId?.end || "N/A"}</span>
          <span className="dot end"></span>
        </div>
        <div className="divider">
          <span><FaChair /> Seats & Fare</span>
        </div>
        <div className="ticket-row">
          <div>
            <strong>Seats</strong>
            <div>{selectedSeats?.length > 0 ? selectedSeats.join(", ") : "N/A"}</div>
          </div>
          <div>
            <strong>Total</strong>
            <div className="amount">
              <FaRupeeSign /> {totalAmount ?? (selectedSeats?.length * (busId?.price || 0))}
            </div>
          </div>
        </div>
        <div className="qr-section">
          <div className="qr-placeholder">
            <span>QR</span>
          </div>
          <div className="qr-label">Show this at boarding</div>
        </div>
        <button className="proceed-btn" onClick={handleConfirm}>
          Confirm & download booking details
        </button>
      </div>
      <style jsx>{`
        .confirmation-bg {
          min-height: 100vh;
          padding: 2rem;
          background: #f5f7fa;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .confirmation-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
        }
        .bus-logo {
          font-size: 2.5rem;
          color: #3a86ff;
          margin-right: 1rem;
        }
        .brand {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
        }
        .ticket {
          width: 100%;
          max-width: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .animate-pop {
          animation: pop 0.4s ease-out;
        }
        @keyframes pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .ticket-header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
        }
        .checkmark {
          color: #4caf50;
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .ticket-header h1 {
          margin: 0;
          color: #333;
          font-size: 1.8rem;
        }
        .ticket-id {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.3rem 0.8rem;
          background: #f0f4f8;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #666;
        }
        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: #3a86ff;
          font-weight: bold;
        }
        .divider span {
          margin-right: 0.5rem;
        }
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #eee;
          margin-left: 0.5rem;
        }
        .ticket-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .ticket-row div {
          flex: 1;
        }
        .ticket-row div:first-child {
          margin-right: 1rem;
        }
        .route-row {
          margin-bottom: 1rem;
        }
        .route-visual {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 1.5rem 0;
          position: relative;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .dot.start {
          background: #3a86ff;
        }
        .dot.end {
          background: #ff006e;
        }
        .route-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(to right, #3a86ff, #ff006e);
          margin: 0 1rem;
        }
        .route-label {
          font-size: 0.9rem;
          color: #555;
        }
        .amount {
          color: #ff006e;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .icon-cal {
          margin-right: 0.5rem;
          color: #666;
        }
        .qr-section {
          margin-top: 2rem;
          text-align: center;
        }
        .qr-placeholder {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          background: #f0f4f8;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #666;
        }
        .qr-label {
          margin-top: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        .proceed-btn {
          display: block;
          width: 100%;
          padding: 1rem;
          margin-top: 2rem;
          background: #3a86ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }
        .proceed-btn:hover {
          background: #2667cc;
        }
      `}</style>
    </div>
  );
}