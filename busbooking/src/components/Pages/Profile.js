"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    phone: "", 
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch profile");
        }
        
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setBookings(data.bookings || []);
          setFormData({
            phone: data.user.phone || "",
            address: data.user.address || {
              street: "",
              city: "",
              state: "",
              zipCode: ""
            }
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setMessage({ text: "Failed to load profile data", type: "error" });
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      setUser(data.user);
      setIsEditing(false);
      setMessage({ text: "Profile updated successfully", type: "success" });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ text: err.message || "Failed to update profile", type: "error" });
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2 className="profile-title">
          <span className="profile-icon">👤</span> My Profile
        </h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="edit-button"
            aria-label="Edit profile"
          >
            <span className="button-icon">✏️</span> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-info-group">
          <label className="info-label">Name</label>
          <div className="info-value">{user.name}</div>
        </div>

        <div className="profile-info-group">
          <label className="info-label">Email</label>
          <div className="info-value">{user.email}</div>
        </div>

        <div className="profile-info-group">
          <label className="info-label">Role</label>
          <div className="info-value role-badge">{user.role}</div>
        </div>

        {isEditing ? (
          <>
            <div className="profile-info-group">
              <label className="info-label">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="profile-input"
                placeholder="Enter phone number"
              />
            </div>

            <div className="profile-info-group">
              <label className="info-label">Address</label>
              <div className="address-fields">
                <input
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="Street"
                />
                <div className="address-row">
                  <input
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="City"
                  />
                  <input
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="State"
                  />
                  <input
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>

            <div className="button-group">
              <button onClick={handleUpdate} className="save-button">
                <span className="button-icon">💾</span> Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">
                <span className="button-icon">❌</span> Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="profile-info-group">
              <label className="info-label">Phone</label>
              <div className="info-value">
                {user.phone || <span className="empty-field">Not provided</span>}
              </div>
            </div>

            <div className="profile-info-group">
              <label className="info-label">Address</label>
              <div className="info-value">
                {user.address ? (
                  <div className="address-display">
                    {user.address.street && <div>{user.address.street}</div>}
                    {(user.address.city || user.address.state || user.address.zipCode) && (
                      <div>
                        {user.address.city && <span>{user.address.city}</span>}
                        {user.address.state && <span>, {user.address.state}</span>}
                        {user.address.zipCode && <span> {user.address.zipCode}</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="empty-field">Not provided</span>
                )}
              </div>
            </div>
          </>
        )}

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="bookings-section">
        <h3 className="section-title">
          <span className="section-icon">🚌</span> Booking History
        </h3>

        {bookings.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">📭</div>
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h4 className="booking-title">
                    {booking.bus?.busName || 'N/A'} ({booking.bus?.busNumber || 'N/A'})
                  </h4>
                  <span className={`booking-status ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="booking-route">
                  <span className="route-from">{booking.bus?.route?.from || 'N/A'}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{booking.bus?.route?.to || 'N/A'}</span>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <span className="detail-label">Seat:</span>
                    <span className="detail-value">{booking.seatNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(booking.journeyDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value price">${booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
          color:rgb(241, 243, 247);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .profile-title {
          font-size: 2rem;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .profile-icon {
          font-size: 1.8rem;
        }

        .profile-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-bottom: 3rem;
        }

        .profile-info-group {
          margin-bottom: 1.5rem;
        }

        .info-label {
          display: block;
          font-size: 0.875rem;
          color: #718096;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .info-value {
          font-size: 1.125rem;
          color: #1a202c;
          font-weight: 500;
        }

        .empty-field {
          color: #a0aec0;
          font-style: italic;
        }

        .role-badge {
          display: inline-block;
          background: #e2e8f0;
          color: #2d3748;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        .profile-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-top: 0.25rem;
        }

        .profile-input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }

        .address-fields {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .address-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem;
        }

        .address-display {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .edit-button, .save-button, .cancel-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .edit-button {
          background: #4299e1;
          color: white;
        }

        .edit-button:hover {
          background: #3182ce;
        }

        .save-button {
          background: #48bb78;
          color: white;
        }

        .save-button:hover {
          background: #38a169;
        }

        .cancel-button {
          background: #e2e8f0;
          color: #4a5568;
        }

        .cancel-button:hover {
          background: #cbd5e0;
        }

        .button-icon {
          font-size: 1.1rem;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1.5rem;
          font-weight: 500;
          text-align: center;
        }

        .message.success {
          background: #f0fff4;
          color: #2f855a;
          border: 1px solid #c6f6d5;
        }

        .message.error {
          background: #fff5f5;
          color: #c53030;
          border: 1px solid #fed7d7;
        }

        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #4299e1;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }

        .loading-text {
          text-align: center;
          color: #718096;
          font-size: 1.125rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .bookings-section {
          margin-top: 3rem;
        }

        .section-title {
          font-size: 1.5rem;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .section-icon {
          font-size: 1.4rem;
        }

        .empty-bookings {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .booking-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .booking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .booking-title {
          font-size: 1.125rem;
          color: #2d3748;
          margin: 0;
        }

        .booking-status {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          text-transform: capitalize;
        }

        .booking-status.confirmed {
          background: #c6f6d5;
          color: #22543d;
        }

        .booking-status.pending {
          background: #feebc8;
          color: #7b341e;
        }

        .booking-status.cancelled {
          background: #fed7d7;
          color: #822727;
        }

        .booking-route {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 500;
          color: #4a5568;
        }

        .route-arrow {
          color: #a0aec0;
        }

        .booking-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #718096;
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #2d3748;
        }

        .price {
          color: #2b6cb0;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .address-row {
            grid-template-columns: 1fr;
          }

          .button-group {
            flex-direction: column;
          }

          .bookings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}