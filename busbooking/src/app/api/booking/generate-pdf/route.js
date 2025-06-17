import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { sendMailWithAttachment } from "@/lib/mailer";
import { connectToDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Bus from "@/models/Bus";

export async function POST(req) {
  try {
    const { booking } = await req.json();
    console.log("Booking data:", booking);

    // Create a new PDF document
    const doc = new jsPDF();

    // Header with background
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text("EchoBus", 105, 25, { align: "center" });

    doc.setFontSize(14);
    doc.text("Booking Confirmation", 105, 35, { align: "center" });

    // Booking details box
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 50, 180, 100, 3, 3);

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text("Booking Details", 25, 60);

    // Line under title
    doc.setDrawColor(200, 200, 200);
    doc.line(25, 65, 185, 65);

    // Booking content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const totalAmount = booking.totalAmount || (booking.selectedSeats?.length * (booking.busInfo?.price || 0));

    const details = [
      { label: "Booking ID", value: booking._id },
      { label: "Passenger", value: booking.userInfo?.name },
      { label: "Email", value: booking.userInfo?.email },
      { label: "Phone", value: booking.userInfo?.phone },
      { label: "Gender", value: booking.userInfo?.gender },
      { label: "Journey Date", value: new Date(booking.journeyDate).toLocaleDateString() },
      { label: "Bus", value: `${booking.busInfo?.start} to ${booking.busInfo?.end}` },
      { label: "Seats", value: booking.selectedSeats?.join(", ") },
      { label: "Price per Seat", value: `₹${booking.busInfo?.price || 0}` },
      { label: "Total Amount", value: `₹${totalAmount}` }
    ];

    details.forEach((detail, index) => {
      const y = 75 + (index * 10);
      const x = index % 2 === 0 ? 25 : 105;

      doc.setFont('helvetica', 'bold');
      doc.text(`${detail.label}:`, x, y);
      doc.setFont('helvetica', 'normal');
      doc.text(detail.value, x + 35, y);
    });

    // Payment instructions box
    doc.setFillColor(236, 240, 241);
    doc.roundedRect(15, 160, 180, 50, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(231, 76, 60);
    doc.text("Payment Instructions", 25, 170);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(11);
    doc.text([
      `• Total Payment Amount: ₹${totalAmount}`,
      `• Payment Method: Cash payment at the bus`,
      `• Please pay the full amount before boarding`,
      `• Keep this confirmation for reference`
    ], 25, 180);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for choosing EchoBus!", 105, 250, { align: "center" });
    doc.text("For any queries, please contact our customer support.", 105, 255, { align: "center" });

    // Page border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);

    // PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Send Email
    if (booking?.userInfo?.email) {
      try {
        await sendMailWithAttachment({
          to: booking.userInfo.email,
          subject: "EchoBus - Your Booking Confirmation",
          text: `Dear ${booking.userInfo.name},\n\nThank you for booking with EchoBus. Please find your booking confirmation attached to this email.\n\nJourney: ${booking.busInfo?.start} to ${booking.busInfo?.end}\nJourney Date: ${new Date(booking.journeyDate).toLocaleDateString()}\nSeats: ${booking.selectedSeats?.join(", ")}\nTotal Amount: ₹${totalAmount}\n\nPlease remember to pay the amount before boarding the bus.\n\nBest regards,\nEchoBus Team`,
          filename: `EchoBusBooking-${booking._id}.pdf`,
          content: pdfBuffer
        });
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    // ✅ STEP: Update Booking Status, Block Seats, Decrease Total Seats
    await connectToDB();

    // 1. Update booking status to "confirmed"
    await Booking.findByIdAndUpdate(booking._id, {
      status: "confirmed"
    });

    // 2. Prepare bookedSeats array
    const busId = booking.busId._id || booking.busId;
    const newSeats = booking.selectedSeats.map(seat => ({
      seat,
      gender: booking.userInfo.gender,
      journeyDate: new Date(booking.journeyDate).toISOString().split("T")[0]
    }));

    // 3. Decrease totalSeats by number of selected seats
    const seatCount = booking.selectedSeats?.length || 0;

    await Bus.findByIdAndUpdate(busId, {
      $inc: { totalSeats: -seatCount }, // decrease totalSeats
      $push: { bookedSeats: { $each: newSeats } } // block the seats
    });

    // ✅ Return PDF response
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=EchoBusBooking.pdf',
      },
    });

  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { message: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
