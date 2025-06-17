"use client";

import { useState } from "react";
import styles from "@/components/Styles/SignUp.module.css";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/signup/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message);

    setOtpSent(true);
    setSuccess("OTP sent to your email. Please verify.");
  };

  const handleOtpSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/signup/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, otp }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message);

    setSuccess("Account created successfully. Redirecting to login...");
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign Up</h1>
      {!otpSent ? (
        <form onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name"autoComplete="off"/>
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" autoComplete="off"/>
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" autoComplete="off"/>
          <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Password" />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <button type="submit">Verify OTP & Register</button>
        </form>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </div>
  );
}
