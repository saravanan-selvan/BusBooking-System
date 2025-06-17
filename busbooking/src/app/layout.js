// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { metadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export { metadata };

// Root layout must be a server component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: "linear-gradient(45deg, #e9f2ff, #007bff)"  }}>
        <Navigation />
        <main>
          {children}
        </main>
        <footer style={{ 
          padding: "1rem", 
          color: "#ffffff", 
          borderTop: "1px solidrgb(14, 126, 237)",
          textAlign: "center",
          marginTop: "2rem"
        }}>
          <p style={{ margin: 0, color: "#ffffff" }}>© 2024 Echo Bus Booking. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
