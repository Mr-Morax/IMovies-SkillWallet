// server/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const User = require("../models/userModel");

// Optional middleware to extract user if JWT token is passed in header
const extractUserOptional = (req, res, next) => {
    try {
        const token =
            req.header("Auth-Token") ||
            req.header("auth-token") ||
            (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : req.headers.authorization);

        if (token) {
            const jwt = require("jsonwebtoken");
            const JWT_SECRET = process.env.JWT_SECRET || "IMOVIES_SECRET_KEY";
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded.userDetails || decoded.adminDetails || decoded;
        }
    } catch (_) {
        // Continue even if token is absent or invalid
    }
    next();
};

router.use(extractUserOptional);

// @route   POST /api/bookings/book, /api/bookings
// @desc    Book seats for a show (checks availability, marks isBooked: true, saves booking)
// @access  Public / Authenticated
router.post(["/book", "/"], async (req, res, next) => {
    try {
        const {
            showId,
            show: showParam,
            seats,
            email,
            userEmail,
            userId,
            user: userParam,
            name,
            userName,
            totalAmount,
            amount,
            paymentStatus,
            paymentId,
        } = req.body;

        const targetShowId = showId || showParam;
        if (!targetShowId) {
            return res.status(400).json({
                status: false,
                msg: "Please provide a valid showId.",
            });
        }

        const requestedSeats = Array.isArray(seats)
            ? seats
            : typeof seats === "string"
                ? seats.split(",").map((s) => s.trim())
                : [];

        if (requestedSeats.length === 0) {
            return res.status(400).json({
                status: false,
                msg: "Please select at least one seat to book.",
            });
        }

        // 1. Locate the show
        let showDoc = await Show.findOne({
            $or: [
                { showId: targetShowId },
                { _id: targetShowId.toString().match(/^[0-9a-fA-F]{24}$/) ? targetShowId : null },
            ].filter(Boolean),
        })
            .populate("movie")
            .populate("theatre");

        if (!showDoc) {
            return res.status(404).json({
                status: false,
                msg: "Show not found.",
            });
        }

        // 2. Verify seats aren't already booked
        const alreadyBooked = [];
        for (const seat of requestedSeats) {
            if (Array.isArray(showDoc.bookedSeats) && showDoc.bookedSeats.includes(seat)) {
                alreadyBooked.push(seat);
            } else if (showDoc.seats && showDoc.seats[seat] && showDoc.seats[seat].isBooked) {
                alreadyBooked.push(seat);
            } else if (showDoc.tickets && showDoc.tickets[seat] && showDoc.tickets[seat].isBooked) {
                alreadyBooked.push(seat);
            }
        }

        if (alreadyBooked.length > 0) {
            return res.status(400).json({
                status: false,
                msg: `Seat(s) ${alreadyBooked.join(", ")} are already booked! Please choose different seats.`,
                alreadyBooked,
            });
        }

        // 3. Resolve or find User
        const targetEmail = (
            email ||
            userEmail ||
            (req.user && req.user.email) ||
            ""
        )
            .toLowerCase()
            .trim();

        const targetUserId =
            userId || userParam || (req.user && (req.user.id || req.user._id));

        let userDoc = null;
        if (targetUserId && targetUserId.toString().match(/^[0-9a-fA-F]{24}$/)) {
            userDoc = await User.findById(targetUserId);
        }
        if (!userDoc && targetEmail) {
            userDoc = await User.findOne({ email: targetEmail });
        }

        if (!userDoc && targetEmail) {
            // Create user profile if booking directly with email
            const bcrypt = require("bcryptjs");
            const tempPassword = await bcrypt.hash("BookingPass" + Date.now(), 10);
            const fallbackName = name || userName || targetEmail.split("@")[0];
            userDoc = await User.create({
                name: fallbackName,
                username: fallbackName,
                email: targetEmail,
                password: tempPassword,
            });
        }

        if (!userDoc) {
            return res.status(400).json({
                status: false,
                msg: "User email or valid user ID is required to complete booking.",
            });
        }

        // 4. Calculate total amount
        let calculatedAmount = Number(totalAmount || amount);
        if (!calculatedAmount || isNaN(calculatedAmount) || calculatedAmount <= 0) {
            calculatedAmount = 0;
            for (const seat of requestedSeats) {
                if (showDoc.seats && showDoc.seats[seat] && showDoc.seats[seat].price) {
                    calculatedAmount += Number(showDoc.seats[seat].price);
                } else if (showDoc.tickets && showDoc.tickets[seat] && showDoc.tickets[seat].price) {
                    calculatedAmount += Number(showDoc.tickets[seat].price);
                } else {
                    calculatedAmount += Number(showDoc.ticketPrice || 250);
                }
            }
        }

        // 5. Mark seats isBooked: true in Show
        if (!showDoc.seats) showDoc.seats = {};
        if (!showDoc.tickets) showDoc.tickets = {};
        if (!Array.isArray(showDoc.bookedSeats)) showDoc.bookedSeats = [];

        for (const seat of requestedSeats) {
            if (!showDoc.bookedSeats.includes(seat)) {
                showDoc.bookedSeats.push(seat);
            }
            if (showDoc.seats[seat]) {
                showDoc.seats[seat].isBooked = true;
            } else {
                showDoc.seats[seat] = { seatNumber: seat, isBooked: true };
            }
            if (showDoc.tickets[seat]) {
                showDoc.tickets[seat].isBooked = true;
            } else {
                showDoc.tickets[seat] = { seatNumber: seat, isBooked: true };
            }
        }

        showDoc.availableSeats = Math.max(
            0,
            (showDoc.totalSeats || 100) - showDoc.bookedSeats.length
        );
        showDoc.markModified("seats");
        showDoc.markModified("tickets");
        showDoc.markModified("bookedSeats");
        await showDoc.save();

        // 6. Save Booking
        const bookingCode =
            "IMOV-" + Math.random().toString(36).substring(2, 9).toUpperCase();

        const bookingData = {
            user: userDoc._id,
            userEmail: userDoc.email,
            userName: userDoc.name || userDoc.username,
            show: showDoc._id,
            movie: showDoc.movie ? (showDoc.movie._id || showDoc.movie) : req.body.movie,
            theatre: showDoc.theatre ? (showDoc.theatre._id || showDoc.theatre) : req.body.theatre,
            seats: requestedSeats,
            totalAmount: calculatedAmount,
            bookingDate: new Date(),
            paymentStatus: paymentStatus || "Completed",
            paymentId: paymentId || `PAY-${Date.now()}`,
            bookingStatus: "Booked",
            bookingCode,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingCode}`,
            reminderSent: false,
        };

        const booking = await Booking.create(bookingData);

        const populatedBooking = await Booking.findById(booking._id)
            .populate("user", "name username email phone")
            .populate("show")
            .populate("movie")
            .populate("theatre");

        return res.status(201).json({
            status: true,
            msg: "Tickets Booked Successfully!",
            booking: populatedBooking || booking,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/bookings/mybookings?email=...
// @desc    Get all bookings for a user by email or authenticated session
// @access  Public / Authenticated
router.get(["/mybookings", "/my-bookings"], async (req, res, next) => {
    try {
        const email = (
            req.query.email ||
            req.query.userEmail ||
            (req.user && req.user.email) ||
            ""
        )
            .toLowerCase()
            .trim();

        const userId = req.query.userId || (req.user && (req.user.id || req.user._id));

        let userDoc = null;
        if (email) {
            userDoc = await User.findOne({ email });
        }

        let query = {};
        if (userDoc && email) {
            query = { $or: [{ user: userDoc._id }, { userEmail: email }] };
        } else if (email) {
            query = { userEmail: email };
        } else if (userId && userId.toString().match(/^[0-9a-fA-F]{24}$/)) {
            query = { user: userId };
        } else {
            return res.status(400).json({
                status: false,
                msg: "Please provide an email query parameter (e.g., /mybookings?email=user@example.com).",
            });
        }

        const bookings = await Booking.find(query)
            .populate("user", "name username email phone")
            .populate("show")
            .populate("movie")
            .populate("theatre")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/bookings/all, /api/bookings
// @desc    Get all bookings (admin/system view)
// @access  Public / Admin
router.get(["/all", "/"], async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate("user", "name username email phone")
            .populate("show")
            .populate("movie")
            .populate("theatre")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/bookings/:id, /api/bookings/getbooking/:id
// @desc    Get single booking by ID or bookingCode
// @access  Public / Authenticated
router.get(["/getbooking/:id", "/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let booking = await Booking.findOne({
            $or: [
                { bookingCode: id },
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            ].filter(Boolean),
        })
            .populate("user", "name username email phone")
            .populate("show")
            .populate("movie")
            .populate("theatre");

        if (!booking) {
            return res.status(404).json({
                status: false,
                msg: "Booking not found.",
            });
        }

        return res.status(200).json({
            status: true,
            booking,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/bookings/cancel/:id, /api/bookings/:id/cancel
// @desc    Cancel booking and release seats back to isBooked: false
// @access  Public / Authenticated
router.post(["/cancel/:id", "/:id/cancel"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let booking = await Booking.findOne({
            $or: [
                { bookingCode: id },
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            ].filter(Boolean),
        });

        if (!booking) {
            return res.status(404).json({
                status: false,
                msg: "Booking not found to cancel.",
            });
        }

        if (booking.bookingStatus === "Cancelled") {
            return res.status(400).json({
                status: false,
                msg: "This booking is already cancelled.",
                booking,
            });
        }

        // Release seats in Show
        const showDoc = await Show.findById(booking.show);
        if (showDoc) {
            const bookedSeatsList = booking.seats || [];

            // 1. Remove from bookedSeats array
            if (Array.isArray(showDoc.bookedSeats)) {
                showDoc.bookedSeats = showDoc.bookedSeats.filter(
                    (seat) => !bookedSeatsList.includes(seat)
                );
            }

            // 2. Mark isBooked: false in show.seats
            if (showDoc.seats) {
                for (const seat of bookedSeatsList) {
                    if (showDoc.seats[seat]) {
                        showDoc.seats[seat].isBooked = false;
                    }
                }
                showDoc.markModified("seats");
            }

            // 3. Mark isBooked: false in show.tickets
            if (showDoc.tickets) {
                for (const seat of bookedSeatsList) {
                    if (showDoc.tickets[seat]) {
                        showDoc.tickets[seat].isBooked = false;
                    }
                }
                showDoc.markModified("tickets");
            }

            // 4. Restore availableSeats counter
            showDoc.availableSeats = Math.min(
                showDoc.totalSeats || 100,
                (showDoc.availableSeats || 0) + bookedSeatsList.length
            );
            showDoc.markModified("bookedSeats");
            await showDoc.save();
        }

        // Update booking state
        booking.bookingStatus = "Cancelled";
        booking.paymentStatus = "Refunded";
        await booking.save();

        return res.status(200).json({
            status: true,
            msg: "Booking Cancelled and seats released successfully!",
            booking,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
