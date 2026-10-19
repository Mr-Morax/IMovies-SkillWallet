// server/utils/cleanupService.js
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");

const cleanupOldBookings = async () => {
    try {
        // Find unconfirmed/pending bookings older than 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const expiredBookings = await Booking.find({
            bookingStatus: { $in: ["PENDING", "Pending"] },
            createdAt: { $lt: fifteenMinutesAgo },
        });

        if (expiredBookings.length === 0) return;

        for (const booking of expiredBookings) {
            // 1. Mark booking as EXPIRED
            booking.bookingStatus = "EXPIRED";
            booking.status = "EXPIRED";
            await booking.save();

            // 2. Locate associated Show to release seats
            const showDoc = await Show.findOne({
                $or: [
                    { _id: booking.show && booking.show.toString().match(/^[0-9a-fA-F]{24}$/) ? booking.show : null },
                    { showId: booking.showId },
                ],
            });

            if (showDoc) {
                const seatList = Array.isArray(booking.seats)
                    ? booking.seats
                    : Object.keys(booking.ticketsData || {});

                const tickets = showDoc.tickets || showDoc.seats || {};

                seatList.forEach((seatNum) => {
                    if (tickets[seatNum]) {
                        tickets[seatNum].isBooked = false;
                    }
                });

                showDoc.markModified("tickets");
                showDoc.markModified("seats");
                if (showDoc.availableSeats !== undefined) {
                    showDoc.availableSeats += seatList.length;
                }
                await showDoc.save();

                console.log(`[Cleanup Service] Released ${seatList.length} seats from expired booking ${booking.bookingId}`);
            }
        }
    } catch (error) {
        console.error("[Cleanup Service Error]:", error.message);
    }
};

module.exports = { cleanupOldBookings };