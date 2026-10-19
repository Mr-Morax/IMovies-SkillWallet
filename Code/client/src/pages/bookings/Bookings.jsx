// client/src/pages/bookings/Bookings.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaQrcode,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaArrowRight,
  FaFilm
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchMyBookings();
  }, [userEmail]);

  const fetchMyBookings = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/bookings/mybookings?email=${userEmail}`);
      if (res.data.status && Array.isArray(res.data.bookings)) {
        setBookings(res.data.bookings);
      }
    } catch (error) {
      toast.error("Could not fetch your booking history.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    const targetId = booking._id || booking.bookingId;
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking ${booking.bookingId}? Your seats will be released.`
    );

    if (!confirmCancel) return;

    setCancellingId(targetId);
    try {
      const res = await api.post(`/bookings/cancel/${targetId}`);
      if (res.data.status) {
        toast.success("Booking cancelled successfully. Seats have been released.");
        // Update local state to reflect cancellation
        setBookings((prev) =>
          prev.map((b) =>
            (b._id === targetId || b.bookingId === targetId)
              ? { ...b, bookingStatus: "CANCELLED", status: "CANCELLED" }
              : b
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <FaTicketAlt className="w-10 h-10 text-brand-red animate-pulse" />
        <p className="text-brand-muted text-sm tracking-wide">Retrieving your digital tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-24 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Page Title */}
        <div className="flex items-center justify-between pb-6 border-b border-brand-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <FaTicketAlt className="w-6 h-6 text-brand-red" /> My Digital M-Tickets
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Active reservations, gate-entry passes, and ticket order history
            </p>
          </div>
          <Link
            to="/home"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-brand-card hover:bg-brand-border border border-brand-border text-xs font-semibold rounded-xl text-white transition-all"
          >
            Explore Movies <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Bookings List */}
        <div className="mt-8 space-y-6">
          {bookings.length === 0 ? (
            <div className="text-center py-20 bg-brand-card/40 border border-brand-border rounded-2xl p-8">
              <FaFilm className="w-12 h-12 text-brand-muted mx-auto mb-3 opacity-30" />
              <h2 className="text-lg font-bold text-white">No Tickets Booked Yet</h2>
              <p className="text-xs text-brand-muted max-w-sm mx-auto mt-1 mb-6">
                You haven't reserved any cinema seats yet. Browse now-showing movies and book your favorite seats!
              </p>
              <Link
                to="/home"
                className="px-6 py-2.5 bg-brand-red hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all inline-block"
              >
                Browse Now Showing
              </Link>
            </div>
          ) : (
            bookings.map((booking) => {
              const bookingId = booking.bookingId || booking._id;
              const isCancelled =
                booking.bookingStatus === "CANCELLED" || booking.status === "CANCELLED";

              // Relational fallbacks
              const showData = booking.show || {};
              const movieTitle =
                showData.movie?.title ||
                showData.movie?.movieName ||
                booking.movieTitle ||
                "Cinema Feature Presentation";
              const theatreName =
                showData.theatre?.name ||
                showData.theatreName ||
                "PVR Cinemas";
              const showDate =
                showData.showDate || showData.showdate || showData.date || "2026-10-20";
              const showTime =
                showData.showTime || showData.showtime || showData.time || "18:30";

              const seatList = Array.isArray(booking.seats)
                ? booking.seats
                : Object.keys(booking.ticketsData || {});

              const totalAmount = booking.totalAmount || booking.amount || 250;

              return (
                <div
                  key={bookingId}
                  className={`relative bg-brand-card border rounded-2xl overflow-hidden transition-all duration-300 shadow-xl ${isCancelled
                      ? "border-brand-border/40 opacity-70"
                      : "border-brand-border hover:border-brand-red/40"
                    }`}
                >
                  <div className="flex flex-col lg:flex-row">

                    {/* Left: Ticket Body */}
                    <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
                      <div>
                        {/* Status Badge & Reference */}
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${isCancelled
                                ? "bg-rose-950/60 border border-rose-800 text-rose-400"
                                : "bg-emerald-950/60 border border-emerald-800 text-emerald-400"
                              }`}
                          >
                            {isCancelled ? (
                              <>
                                <FaTimesCircle className="w-3.5 h-3.5" /> CANCELLED
                              </>
                            ) : (
                              <>
                                <FaCheckCircle className="w-3.5 h-3.5" /> CONFIRMED
                              </>
                            )}
                          </span>

                          <span className="text-[11px] font-mono text-brand-muted tracking-wider">
                            Ref: {bookingId}
                          </span>
                        </div>

                        {/* Movie Title */}
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                          {movieTitle}
                        </h2>

                        {/* Venue & Timing Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-brand-muted">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-brand-muted/70 tracking-wider">
                              Cinema Hall
                            </span>
                            <p className="font-semibold text-white flex items-center gap-1">
                              <FaMapMarkerAlt className="w-3 h-3 text-brand-red shrink-0" />
                              {theatreName}
                            </p>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-brand-muted/70 tracking-wider">
                              Date & Time
                            </span>
                            <p className="font-semibold text-white flex items-center gap-1">
                              <FaCalendarAlt className="w-3 h-3 text-amber-400 shrink-0" />
                              {showDate} &bull; {showTime}
                            </p>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-brand-muted/70 tracking-wider">
                              Reserved Seats ({seatList.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {seatList.map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 bg-brand-dark border border-brand-border text-brand-red font-bold text-xs rounded"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Footer Actions */}
                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-brand-border/60">
                        <div className="text-xs">
                          <span className="text-brand-muted">Total Paid: </span>
                          <span className="font-extrabold text-base text-brand-text">
                            ₹{totalAmount}
                          </span>
                          <span className="text-[10px] text-brand-muted ml-2">
                            ({booking.paymentMethod || "UPI"})
                          </span>
                        </div>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            disabled={cancellingId === (booking._id || booking.bookingId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 text-xs font-semibold rounded-lg transition-all"
                          >
                            <FaBan className="w-3 h-3" />
                            {cancellingId === (booking._id || booking.bookingId)
                              ? "Releasing..."
                              : "Cancel Ticket"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Perforated QR Gate Pass Stub */}
                    <div className="lg:w-48 bg-brand-dark/80 border-t lg:border-t-0 lg:border-l border-dashed border-brand-border/80 p-6 flex flex-col items-center justify-center text-center">
                      <div className="p-3 bg-white rounded-xl shadow-inner mb-3">
                        <FaQrcode className="w-20 h-20 text-black" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">
                        Gate Entry Pass
                      </span>
                      <span className="text-[9px] text-brand-muted/70 mt-0.5">
                        Scan at entrance turnstile
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default Bookings;