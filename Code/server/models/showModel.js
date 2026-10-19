const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
    {
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
        screenName: {
            type: String,
            default: "Screen 1",
            trim: true,
        },
        showDate: {
            type: Date,
            required: [true, "Show date is required"],
        },
        showTime: {
            type: String,
            required: [true, "Show time is required"],
            trim: true,
        },
        ticketPrice: {
            type: Number,
            required: [true, "Ticket price is required"],
            min: [0, "Ticket price cannot be negative"],
        },
        totalSeats: {
            type: Number,
            default: 100,
            min: [1, "Total seats must be at least 1"],
        },
        availableSeats: {
            type: Number,
            default: 100,
            min: [0, "Available seats cannot be negative"],
        },
        bookedSeats: {
            type: [String],
            default: [],
        },
        seats: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        tickets: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        status: {
            type: String,
            enum: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
            default: "Scheduled",
        },
    },
    {
        timestamps: true,
    }
);

showSchema.index({ movie: 1, showDate: 1 });
showSchema.index({ theatre: 1, showDate: 1 });

module.exports = mongoose.model("Show", showSchema);
