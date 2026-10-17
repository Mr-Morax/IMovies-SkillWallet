// server/server.js
require("dotenv").config({ path: "./.env" });

// Prefer IPv4 results to avoid ::1 (IPv6) connection issues
const dns = require("dns");
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const showRoutes = require("./routes/showRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const movieRoutes = require("./routes/movieRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Utility Imports
const { verifyTransport } = require("./utils/mailer");
const { sendReminderEmails } = require("./utils/reminderService");
const { cleanupOldBookings } = require("./utils/cleanupService");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imovies";

// 1. Global Middlewares
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        credentials: true,
    })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 2. Health Check Endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "iMovies Server is healthy and running",
        port: PORT,
    });
});

// 3. Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/theatre", theatreRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth/admin", adminRoutes);
app.use("/api/review", reviewRoutes);

// 4. 404 Route Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

// 5. Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("[Server Error]:", err.stack || err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

// 6. Database Connection & Server Startup
const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || MONGO_URI);
        console.log("Connected to Mongo Successful");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
};

connectToMongo();

// Verify Mailer & Initialize Cron Jobs if implemented
if (typeof verifyTransport === "function") verifyTransport();
if (typeof sendReminderEmails === "function" && typeof cleanupOldBookings === "function") {
    // Run reminder check every 30 minutes & cleanup every hour
    cron.schedule("*/30 * * * *", sendReminderEmails);
    cron.schedule("0 * * * *", cleanupOldBookings);
}

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT} port`);
});

module.exports = { app, connectToMongo };