// server/routes/showRoutes.js
const express = require("express");
const router = express.Router();
const Show = require("../models/showModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");

// Helper to generate seat grid based on theatre tier setup
const generateSeatLayout = (theatre) => {
    const tickets = {};
    const lowerCount = theatre ? theatre.lowerSeats || 50 : 50;
    const middleCount = theatre ? theatre.middleSeats || 100 : 100;
    const balconyCount = theatre ? theatre.balconySeats || 30 : 30;

    for (let i = 1; i <= lowerCount; i++) {
        tickets[`L${i}`] = {
            seatNumber: `L${i}`,
            tier: "LOWER",
            price: (theatre && theatre.lowerSeatPrice) || 150,
            isBooked: false,
        };
    }
    for (let i = 1; i <= middleCount; i++) {
        tickets[`M${i}`] = {
            seatNumber: `M${i}`,
            tier: "MIDDLE",
            price: (theatre && theatre.middleSeatPrice) || 250,
            isBooked: false,
        };
    }
    for (let i = 1; i <= balconyCount; i++) {
        tickets[`B${i}`] = {
            seatNumber: `B${i}`,
            tier: "BALCONY",
            price: (theatre && theatre.balconySeatPrice) || 400,
            isBooked: false,
        };
    }
    return tickets;
};

// @route   GET /api/shows, /api/shows/getshows, /api/shows/all
router.get(["/", "/getshows", "/all"], async (req, res, next) => {
    try {
        const { movieId, movie, theatreName, theatre, date, showdate, showDate } = req.query;
        let query = {};

        const targetMovie = movieId || movie;
        if (targetMovie) {
            query.$or = [{ movieId: targetMovie }, { movie: targetMovie }];
        }

        const targetTheatre = theatreName || theatre;
        if (targetTheatre) {
            query.$or = [
                { theatreName: { $regex: targetTheatre, $options: "i" } },
                { theatre: targetTheatre },
            ];
        }

        const targetDate = showDate || date || showdate;
        if (targetDate) {
            query.$or = [
                { showDate: targetDate },
                { showdate: targetDate },
                { date: targetDate },
            ];
        }

        const shows = await Show.find(query)
            .populate("movie")
            .populate("theatre")
            .sort({ showDate: 1, showTime: 1 });

        return res.status(200).json({
            status: true,
            count: shows.length,
            shows,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/shows/:id, /api/shows/getshow/:id
router.get(["/getshow/:id", "/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let show = await Show.findOne({
            $or: [{ showId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        })
            .populate("movie")
            .populate("theatre");

        if (!show) {
            return res.status(404).json({
                status: false,
                msg: "Show not found.",
            });
        }

        return res.status(200).json({
            status: true,
            show,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/shows/addshow, /api/shows
router.post(["/addshow", "/"], async (req, res, next) => {
    try {
        const {
            showId,
            movieId,
            movie,
            theatreName,
            theatre,
            adminEmail,
            showDate,
            showdate,
            date,
            showTime,
            showtime,
            time,
            ticketPrice,
            pricing,
            tickets,
            seats,
        } = req.body;

        const resolvedMovieId = (movieId || movie || "").toString().trim();
        const resolvedTheatreName = (theatreName || theatre || "").toString().trim();
        const resolvedDate = showDate || showdate || date;
        const resolvedTime = showTime || showtime || time;

        if (!resolvedMovieId || !resolvedTheatreName || !resolvedDate || !resolvedTime) {
            return res.status(400).json({
                status: false,
                msg: "Please provide movieId, theatreName, showDate, and showTime.",
            });
        }

        // Lookup Theatre to inherit seating capacities & pricing
        let theatreDoc = null;
        if (resolvedTheatreName.match(/^[0-9a-fA-F]{24}$/)) {
            theatreDoc = await Theatre.findById(resolvedTheatreName);
        }
        if (!theatreDoc) {
            theatreDoc = await Theatre.findOne({
                $or: [
                    { name: resolvedTheatreName },
                    { theatreName: resolvedTheatreName },
                    { theatreId: resolvedTheatreName },
                ],
            });
        }

        // Lookup Movie
        let movieDoc = null;
        if (resolvedMovieId.match(/^[0-9a-fA-F]{24}$/)) {
            movieDoc = await Movie.findById(resolvedMovieId);
        }
        if (!movieDoc) {
            movieDoc = await Movie.findOne({
                $or: [{ movieId: resolvedMovieId }, { title: resolvedMovieId }],
            });
        }

        const finalShowId = showId || `SHOW-${Date.now()}`;
        const generatedSeats =
            (tickets && Object.keys(tickets).length > 0)
                ? tickets
                : (seats && Object.keys(seats).length > 0)
                    ? seats
                    : generateSeatLayout(theatreDoc);

        const totalSeatsCount = theatreDoc
            ? (theatreDoc.lowerSeats || 50) +
            (theatreDoc.middleSeats || 100) +
            (theatreDoc.balconySeats || 30)
            : 180;

        const resolvedTicketPrice = Number(
            ticketPrice || (theatreDoc && (theatreDoc.middleSeatPrice || theatreDoc.lowerSeatPrice)) || 250
        );

        const showData = {
            showId: finalShowId,
            // Reference both ObjectId and custom string IDs
            movie: movieDoc ? movieDoc._id : resolvedMovieId,
            movieId: movieDoc ? movieDoc.movieId || movieDoc._id : resolvedMovieId,
            theatre: theatreDoc ? theatreDoc._id : resolvedTheatreName,
            theatreName: theatreDoc ? theatreDoc.name || theatreDoc.theatreName : resolvedTheatreName,
            adminEmail: adminEmail || "admin@imovies.com",

            // Satisfies both camelCase and lowercase schema variants
            showDate: resolvedDate,
            showdate: resolvedDate,
            date: resolvedDate,
            showTime: resolvedTime,
            showtime: resolvedTime,
            time: resolvedTime,

            ticketPrice: resolvedTicketPrice,
            pricing: pricing || {
                lower: theatreDoc ? theatreDoc.lowerSeatPrice || 150 : 150,
                middle: theatreDoc ? theatreDoc.middleSeatPrice || 250 : 250,
                balcony: theatreDoc ? theatreDoc.balconySeatPrice || 400 : 400,
            },

            totalSeats: totalSeatsCount,
            availableSeats: totalSeatsCount,
            tickets: generatedSeats,
            seats: generatedSeats,
        };

        const newShow = await Show.create(showData);

        return res.status(201).json({
            status: true,
            msg: "Show Scheduled Successfully!",
            show: newShow,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/shows/:id, /api/shows/deleteshow/:id
router.delete(["/deleteshow/:id", "/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let deleted = await Show.findOneAndDelete({
            $or: [{ showId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });

        if (!deleted) {
            return res.status(404).json({
                status: false,
                msg: "Show not found to delete.",
            });
        }

        return res.status(200).json({
            status: true,
            msg: "Show Deleted Successfully!",
            deletedShow: deleted,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;