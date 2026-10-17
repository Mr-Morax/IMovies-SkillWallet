// server/routes/favoriteRoutes.js
const express = require("express");
const router = express.Router();
const Favorite = require("../models/favoriteModel");
const Movie = require("../models/movieModel");
const User = require("../models/userModel");

// @route   POST /api/favorite, /api/favorite/add
// @desc    Add a movie to favorites
router.post(["/", "/add"], async (req, res, next) => {
    try {
        const { userEmail, email, user, movieId, movie } = req.body;

        const resolvedEmail = (userEmail || email || user || "").toString().trim().toLowerCase();
        const resolvedMovieId = (movieId || movie || "").toString().trim();

        if (!resolvedEmail || !resolvedMovieId) {
            return res.status(400).json({
                status: false,
                msg: "Please provide userEmail and movieId.",
            });
        }

        // 1. Resolve User ObjectId
        let userDoc = null;
        if (resolvedEmail.match(/^[0-9a-fA-F]{24}$/)) {
            userDoc = await User.findById(resolvedEmail);
        }
        if (!userDoc) {
            userDoc = await User.findOne({ email: resolvedEmail });
        }

        if (!userDoc) {
            return res.status(404).json({
                status: false,
                msg: "User not found with the provided email. Please register or login first.",
            });
        }

        // 2. Resolve Movie ObjectId
        let movieDoc = null;
        if (resolvedMovieId.match(/^[0-9a-fA-F]{24}$/)) {
            movieDoc = await Movie.findById(resolvedMovieId);
        }
        if (!movieDoc) {
            movieDoc = await Movie.findOne({
                $or: [{ movieId: resolvedMovieId }, { title: resolvedMovieId }],
            });
        }

        if (!movieDoc) {
            return res.status(404).json({
                status: false,
                msg: "Movie not found with the provided ID.",
            });
        }

        // 3. Prevent Duplicate Favorites
        const existing = await Favorite.findOne({
            $or: [
                { user: userDoc._id, movie: movieDoc._id },
                { userEmail: resolvedEmail, movieId: movieDoc._id.toString() },
            ],
        });

        if (existing) {
            return res.status(409).json({
                status: false,
                msg: "This movie is already in your favorites watchlist.",
                favorite: existing,
            });
        }

        const favoriteData = {
            user: userDoc._id,
            userEmail: userDoc.email,
            movie: movieDoc._id,
            movieId: movieDoc.movieId || movieDoc._id.toString(),
        };

        const favorite = await Favorite.create(favoriteData);

        return res.status(201).json({
            status: true,
            msg: "Movie added to favorites successfully!",
            favorite,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/favorite, /api/favorite/myfavorites
// @desc    Get user's favorites enriched with movie details
router.get(["/", "/myfavorites", "/my-favorites"], async (req, res, next) => {
    try {
        const userEmail = (req.query.email || req.query.userEmail || "").toString().trim().toLowerCase();

        if (!userEmail) {
            return res.status(400).json({
                status: false,
                msg: "Please provide an email query parameter (e.g., ?email=sarah@example.com).",
            });
        }

        const userDoc = await User.findOne({ email: userEmail });
        const userQuery = userDoc
            ? { $or: [{ user: userDoc._id }, { userEmail }] }
            : { userEmail };

        const favorites = await Favorite.find(userQuery).populate("movie").sort({ _id: -1 });

        return res.status(200).json({
            status: true,
            count: favorites.length,
            favorites,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/favorite/:id
router.delete(["/:id", "/remove/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let deleted = await Favorite.findOneAndDelete({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { movieId: id },
            ],
        });

        if (!deleted) {
            return res.status(404).json({
                status: false,
                msg: "Favorite record not found to remove.",
            });
        }

        return res.status(200).json({
            status: true,
            msg: "Movie removed from favorites.",
            deleted,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;