// server/routes/theatreRoutes.js
const express = require("express");
const router = express.Router();
const Theatre = require("../models/theatreModel");

// @route   GET /api/theatre, /api/theatre/gettheatres, /api/theatre/all
router.get(["/", "/gettheatres", "/all"], async (req, res, next) => {
    try {
        const { location, city } = req.query;
        let query = {};
        const loc = city || location;

        if (loc) {
            query.$or = [
                { city: { $regex: loc, $options: "i" } },
                { location: { $regex: loc, $options: "i" } },
            ];
        }

        const theatres = await Theatre.find(query);

        return res.status(200).json({
            status: true,
            count: theatres.length,
            theatres,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/theatre/:id, /api/theatre/gettheatre/:id
router.get(["/gettheatre/:id", "/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let theatre = await Theatre.findOne({
            $or: [
                { theatreId: id },
                { name: id },
                { theatreName: id },
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            ],
        });

        if (!theatre) {
            return res.status(404).json({
                status: false,
                msg: "Theatre not found.",
            });
        }

        return res.status(200).json({
            status: true,
            theatre,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/theatre/addtheatre, /api/theatre
router.post(["/addtheatre", "/"], async (req, res, next) => {
    try {
        const {
            theatreId,
            name,
            theatreName,
            adminName,
            city,
            location,
            lowerSeats,
            middleSeats,
            balconySeats,
            lowerSeatPrice,
            middleSeatPrice,
            balconySeatPrice,
        } = req.body;

        const resolvedName = (name || theatreName || "").trim();
        const resolvedCity = (city || location || "").trim();
        const finalTheatreId = theatreId || `THT-${Date.now()}`;

        if (!resolvedName || !resolvedCity) {
            return res.status(400).json({
                status: false,
                msg: "Please provide both theatre name and city.",
            });
        }

        const theatreData = {
            theatreId: finalTheatreId,
            name: resolvedName,
            theatreName: resolvedName,
            adminName: adminName ? adminName.trim() : "Admin",
            city: resolvedCity,
            location: resolvedCity,
            lowerSeats: Number(lowerSeats) || 50,
            middleSeats: Number(middleSeats) || 100,
            balconySeats: Number(balconySeats) || 30,
            lowerSeatPrice: Number(lowerSeatPrice) || 150,
            middleSeatPrice: Number(middleSeatPrice) || 250,
            balconySeatPrice: Number(balconySeatPrice) || 400,
        };

        const theatre = await Theatre.create(theatreData);

        return res.status(201).json({
            status: true,
            msg: "Theatre Registered Successfully!",
            theatre,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/theatre/:id, /api/theatre/deletetheatre/:id
router.delete(["/deletetheatre/:id", "/:id"], async (req, res, next) => {
    try {
        const { id } = req.params;

        let deleted = await Theatre.findOneAndDelete({
            $or: [
                { theatreId: id },
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            ],
        });

        if (!deleted) {
            return res.status(404).json({
                status: false,
                msg: "Theatre not found to delete.",
            });
        }

        return res.status(200).json({
            status: true,
            msg: "Theatre Deleted Successfully!",
            deletedTheatre: deleted,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;