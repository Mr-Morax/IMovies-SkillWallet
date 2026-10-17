// server/routes/movieRoutes.js
const express = require("express");
const router = express.Router();
const Movie = require("../models/movieModel");

// @route   GET /api/movie, /api/movie/getmovies, /api/movie/all
router.get(["/", "/getmovies", "/all"], async (req, res, next) => {
    try {
        const { genre, search } = req.query;
        let query = {};

        if (genre) {
            query.genres = { $regex: genre, $options: "i" };
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { movieName: { $regex: search, $options: "i" } },
            ];
        }

        const movies = await Movie.find(query).sort({ _id: -1 });

        return res.status(200).json({
            status: true,
            count: movies.length,
            movies,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/movie/:id, /api/movie/getmovie/:id
router.get(["/getmovie/:id", "/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let movie = await Movie.findOne({
            $or: [{ movieId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });

        if (!movie) {
            return res.status(404).json({
                status: false,
                msg: "Movie not found with the provided ID.",
            });
        }

        return res.status(200).json({
            status: true,
            movie,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/movie/addmovie, /api/movie
router.post(["/addmovie", "/"], async (req, res, next) => {
    try {
        const {
            movieId,
            title,
            movieName,
            description,
            genres,
            releaseDate,
            duration,
            runtime,
            certification,
            poster,
            media,
            shows,
        } = req.body;

        const resolvedTitle = (title || movieName || "").trim();
        const resolvedDuration = Number(duration || runtime || 120);
        const resolvedPoster =
            (poster || media || "https://images.unsplash.com/photo-1534447677768-be436bb09401").trim();
        const finalMovieId = movieId || `MOV-${Date.now()}`;

        if (!resolvedTitle || !description) {
            return res.status(400).json({
                status: false,
                msg: "Please provide movie title and description.",
            });
        }

        // Populate both field variations so whatever the schema defines is satisfied
        const movieData = {
            movieId: finalMovieId,
            title: resolvedTitle,
            movieName: resolvedTitle,
            description: description.trim(),
            genres: Array.isArray(genres) ? genres.join(", ") : genres || "Action",
            releaseDate: releaseDate || new Date().toISOString().split("T")[0],
            duration: resolvedDuration,
            runtime: resolvedDuration,
            certification: certification || "UA",
            poster: resolvedPoster,
            media: resolvedPoster,
            shows: shows || [],
        };

        const movie = await Movie.create(movieData);

        return res.status(201).json({
            status: true,
            msg: "Movie Added Successfully!",
            movie,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/movie/:id, /api/movie/deletemovie/:id
router.delete(["/deletemovie/:id", "/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let deleted = await Movie.findOneAndDelete({
            $or: [{ movieId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });

        if (!deleted) {
            return res.status(404).json({
                status: false,
                msg: "Movie not found to delete.",
            });
        }

        return res.status(200).json({
            status: true,
            msg: "Movie Deleted Successfully!",
            deletedMovie: deleted,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;