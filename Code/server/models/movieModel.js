const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Movie title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Movie description is required"],
            trim: true,
        },
        genre: {
            type: [String],
            required: [true, "At least one genre is required"],
        },
        language: {
            type: [String],
            required: [true, "Language is required"],
        },
        duration: {
            type: Number,
            required: [true, "Movie duration (in minutes) is required"],
        },
        releaseDate: {
            type: Date,
            required: [true, "Release date is required"],
        },
        poster: {
            type: String,
            required: [true, "Poster URL is required"],
        },
        backdrop: {
            type: String,
            default: "",
        },
        trailerUrl: {
            type: String,
            default: "",
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 10,
        },
        totalVotes: {
            type: Number,
            default: 0,
        },
        director: {
            type: String,
            trim: true,
            default: "",
        },
        cast: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ["Upcoming", "Now Showing", "Ended"],
            default: "Now Showing",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Movie", movieSchema);
