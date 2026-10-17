const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

// Compound unique index to prevent duplicate favorites per user
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
