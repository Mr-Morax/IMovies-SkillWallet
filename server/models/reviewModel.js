const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: [true, "Movie reference is required"],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [10, "Rating cannot exceed 10"],
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Allow one review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
