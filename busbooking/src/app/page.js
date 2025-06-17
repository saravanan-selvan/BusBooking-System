"use client";

import styles from "./page.module.css";
import Login from "@/components/Pages/Login"

export default function Home() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Welcome to Echo BusBooking</h1>
      <Login />
    </div>
  );
}
