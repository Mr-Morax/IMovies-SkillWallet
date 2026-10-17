// server/utils/reminderService.js
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const { sendBookingConfirmation } = require("./mailer");

const sendReminderEmails = async () => {
    try {
        // Current date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Find shows scheduled for today
        const upcomingShows = await Show.find({
            $or: [{ showDate: today }, { showdate: today }, { date: today }],
        }).populate("movie theatre");

        if (upcomingShows.length === 0) return;

        for (const show of upcomingShows) {
            const bookings = await Booking.find({
                $or: [{ show: show._id }, { showId: show.showId || show._id.toString() }],
                bookingStatus: { $in: ["CONFIRMED", "Confirmed"] },
            });

            for (const booking of bookings) {
                if (booking.reminderSent) continue;

                console.log(`[Reminder Service] Sending alert to ${booking.userEmail} for show ${show.showTime}`);

                // Mark as sent to prevent duplicate reminder notifications
                booking.reminderSent = true;
                await booking.save();
            }
        }
    } catch (error) {
        console.error("[Reminder Service Error]:", error.message);
    }
};

module.exports = { sendReminderEmails };