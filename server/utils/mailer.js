// server/utils/mailer.js
const nodemailer = require("nodemailer");

const isConfigured = Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== "your_email@gmail.com"
);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER || "no-reply@imovies.com",
        pass: process.env.SMTP_PASS || "dummy_password",
    },
});

const verifyTransport = async () => {
    if (!isConfigured) {
        console.log("[Mailer] SMTP credentials not set; running in development simulation mode.");
        return;
    }
    try {
        await transporter.verify();
        console.log("[Mailer] SMTP Server is ready to dispatch emails.");
    } catch (error) {
        console.log("[Mailer] SMTP Warning:", error.message);
    }
};

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
    const { bookingId, movieTitle, showDate, showTime, seats, totalAmount } = bookingDetails;

    const mailOptions = {
        from: `"iMovies Ticketing" <${process.env.SMTP_USER || "no-reply@imovies.com"}>`,
        to: userEmail,
        subject: `Booking Confirmed: ${movieTitle} [${bookingId}]`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #e50914;">iMovies Ticket Confirmation</h2>
        <p>Hi there,</p>
        <p>Your tickets have been confirmed! Below are your booking details:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td><strong>Booking ID:</strong></td><td>${bookingId}</td></tr>
          <tr><td><strong>Movie:</strong></td><td>${movieTitle || "Movie"}</td></tr>
          <tr><td><strong>Date & Time:</strong></td><td>${showDate} at ${showTime}</td></tr>
          <tr><td><strong>Seats:</strong></td><td>${Array.isArray(seats) ? seats.join(", ") : seats}</td></tr>
          <tr><td><strong>Total Paid:</strong></td><td>₹${totalAmount}</td></tr>
        </table>
        <p style="margin-top: 20px;">Please show this confirmation email at the cinema entrance.</p>
        <p style="color: #888; font-size: 12px;">Thank you for choosing iMovies.</p>
      </div>
    `,
    };

    if (!isConfigured) {
        console.log(`[Mailer Mock] Email dispatched to ${userEmail} for Booking ID ${bookingId}`);
        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("[Mailer Error] Failed to send email:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    verifyTransport,
    sendBookingConfirmation,
    transporter,
};