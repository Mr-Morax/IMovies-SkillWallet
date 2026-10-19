const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Theatre name is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Theatre location/area is required"],
            trim: true,
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        totalScreens: {
            type: Number,
            default: 1,
            min: 1,
        },
        facilities: {
            type: [String],
            default: ["Air Conditioned", "Dolby Atmos", "Food Court", "Parking"],
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Theatre", theatreSchema);
