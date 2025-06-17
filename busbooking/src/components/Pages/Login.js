// components/Pages/Login.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/Styles/Login.module.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
  
        if (data.authenticated) {
          if (data.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/home");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
  
    checkAuth();
  }, []);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
  
      setSuccess("Login successful! Redirecting...");
  
      // ✅ Role-based redirect here
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/home");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Login error:", err);
    }
  };  
  
  

  const handleRedirect = () => {
    router.push("/SignUp");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            autoComplete="off"
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <p className={styles.redirectText}>
          Don&apos;t have an account?{" "}
          <button className={styles.linkButton} onClick={handleRedirect}>
            Go to Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
  

