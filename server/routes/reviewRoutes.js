// server/routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const Review = require("../models/reviewModel");
const Movie = require("../models/movieModel");
const User = require("../models/userModel");

// @route   POST /api/review, /api/review/addreview
// @desc    Submit a user review and rating
router.post(["/", "/addreview", "/add"], async (req, res, next) => {
    try {
        const {
            reviewId,
            movieId,
            movie,
            user,
            email,
            userEmail,
            username,
            name,
            rating,
            review,
            comment,
        } = req.body;

        const resolvedMovieId = (movieId || movie || "").toString().trim();
        const resolvedEmail = (email || userEmail || user || "").toString().trim().toLowerCase();
        const resolvedReview = (review || comment || "").toString().trim();
        const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));

        if (!resolvedMovieId || !resolvedReview) {
            return res.status(400).json({
                status: false,
                msg: "Please provide movieId and review text.",
            });
        }

        // 1. Resolve Movie ObjectId
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

        // 2. Resolve User ObjectId
        let userDoc = null;
        if (resolvedEmail.match(/^[0-9a-fA-F]{24}$/)) {
            userDoc = await User.findById(resolvedEmail);
        }
        if (!userDoc && resolvedEmail) {
            userDoc = await User.findOne({ email: resolvedEmail });
        }
        // If not found by email, pick the first user or create a guest reference
        if (!userDoc) {
            userDoc = await User.findOne();
        }

        // Auto-provision user record if database has zero users
        if (!userDoc) {
            userDoc = await User.create({
                username: username || name || "sarah",
                email: resolvedEmail || "sarah@example.com",
                password: "Password123!",
            });
        }

        const finalReviewId = reviewId || `REV-${Date.now()}`;

        const reviewData = {
            reviewId: finalReviewId,
            user: userDoc ? userDoc._id : null,
            movie: movieDoc._id,
            movieId: movieDoc.movieId || movieDoc._id.toString(),
            username: username || name || (userDoc ? userDoc.username : "Guest User"),
            email: userDoc ? userDoc.email : resolvedEmail,
            rating: numericRating,
            review: resolvedReview,
            comment: resolvedReview,
            datetime: new Date(),
        };

        const newReview = await Review.create(reviewData);

        return res.status(201).json({
            status: true,
            msg: "Review Submitted Successfully!",
            review: newReview,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/review/movie/:movieId, /api/review
// @desc    Get reviews for a movie
router.get(["/movie/:movieId", "/:movieId", "/"], async (req, res, next) => {
    try {
        const targetMovieId = req.params.movieId || req.query.movieId;
        let query = {};

        if (targetMovieId) {
            if (targetMovieId.match(/^[0-9a-fA-F]{24}$/)) {
                query.$or = [{ movie: targetMovieId }, { movieId: targetMovieId }];
            } else {
                query.movieId = targetMovieId;
            }
        }

        const reviews = await Review.find(query).populate("user", "username email").sort({ _id: -1 });

        const averageRating =
            reviews.length > 0
                ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1)
                : 0;

        return res.status(200).json({
            status: true,
            count: reviews.length,
            averageRating: Number(averageRating),
            reviews,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/review/:id
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await Review.findOneAndDelete({
            $or: [
                { reviewId: id },
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            ],
        });

        if (!deleted) {
            return res.status(404).json({
                status: false,
                msg: "Review not found to delete.",
            });
        }

        return res.status(200).json({
            status: true,
            msg: "Review deleted successfully.",
            deleted,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;