const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        userEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        userName: {
            type: String,
            trim: true,
        },
        show: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Show",
            required: [true, "Show reference is required"],
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: [true, "Movie reference is required"],
        },
        theatre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theatre",
            required: [true, "Theatre reference is required"],
        },
        seats: {
            type: [String],
            required: [true, "At least one seat must be selected"],
        },
        totalAmount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total amount cannot be negative"],
        },
        bookingDate: {
            type: Date,
            default: Date.now,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Completed", "Failed", "Refunded"],
            default: "Pending",
        },
        paymentId: {
            type: String,
            default: "",
        },
        bookingStatus: {
            type: String,
            enum: ["Booked", "Cancelled", "Pending"],
            default: "Pending",
        },
        bookingCode: {
            type: String,
            default: () => "IMOV-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        },
        qrCode: {
            type: String,
            default: "",
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
