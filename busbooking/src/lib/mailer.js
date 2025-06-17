// lib/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // Your Gmail
    pass: process.env.EMAIL_PASS,     // App password
  },
});

export const sendOtpMail = async ({ to, otp }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "EchoBus - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2980b9;">EchoBus OTP Verification</h2>
          <p>Your OTP for verification is: <strong style="font-size: 20px; color: #e74c3c;">${otp}</strong></p>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #7f8c8d; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Send OTP email error:", err);
    return false;
  }
};

export const sendMailWithAttachment = async ({ to, subject, text, filename, content }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: [
        {
          filename,
          content,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Send email with attachment error:", err);
    return false;
  }
};
