// client/src/pages/seatsPage/SeatsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaFilm,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaLock,
  FaCreditCard
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const SeatsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "customer@example.com";

  useEffect(() => {
    fetchShowData();
  }, [id]);

  const fetchShowData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shows/${id}`);
      if (res.data.status && res.data.show) {
        setShow(res.data.show);
      } else {
        toast.error("Could not load seat matrix.");
      }
    } catch (error) {
      toast.error("Failed to fetch show information.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatNumber, seatInfo) => {
    if (seatInfo.isBooked) {
      toast.info(`Seat ${seatNumber} is already sold out.`);
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        toast.warning("Maximum of 8 seats per booking allowed.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Group seats by tier
  const ticketsMap = (show && (show.tickets || show.seats)) || {};
  const balconySeats = [];
  const middleSeats = [];
  const lowerSeats = [];

  Object.entries(ticketsMap).forEach(([seatNum, seatData]) => {
    const tier = (seatData.tier || "").toUpperCase();
    if (tier === "BALCONY" || seatNum.startsWith("B")) {
      balconySeats.push({ seatNumber: seatNum, ...seatData });
    } else if (tier === "MIDDLE" || seatNum.startsWith("M")) {
      middleSeats.push({ seatNumber: seatNum, ...seatData });
    } else {
      lowerSeats.push({ seatNumber: seatNum, ...seatData });
    }
  });

  // Calculate Subtotal & Total with convenience fee
  const subtotal = selectedSeats.reduce((acc, seatNum) => {
    const seatInfo = ticketsMap[seatNum] || {};
    return acc + (seatInfo.price || show?.ticketPrice || 250);
  }, 0);

  const convenienceFee = selectedSeats.length > 0 ? Math.round(subtotal * 0.08) : 0;
  const grandTotal = subtotal + convenienceFee;

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat to proceed.");
      return;
    }

    setBookingInProgress(true);
    try {
      const res = await api.post("/bookings/book", {
        showId: id,
        show: id,
        userEmail,
        seats: selectedSeats,
        totalAmount: grandTotal,
        amount: grandTotal,
        paymentMethod,
      });

      if (res.data.status) {
        toast.success(
          `Booking Confirmed! Reference: ${res.data.booking.bookingId || "BKG-SUCCESS"}`
        );
        // Redirect to customer bookings overview
        navigate("/bookings");
      }
    } catch (error) {
      const msg = error.response?.data?.msg || "Booking failed. Please try again.";
      toast.error(msg);
      // Refresh seating grid if there was a collision
      fetchShowData();
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <FaFilm className="w-10 h-10 text-brand-red animate-pulse" />
        <p className="text-brand-muted text-sm tracking-wide">Initializing cinema seat layout...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Show Not Found</h2>
        <Link to="/home" className="text-brand-red hover:underline text-sm mt-3 inline-block">
          &larr; Return to Home
        </Link>
      </div>
    );
  }

  const movieTitle = show.movie?.title || show.movie?.movieName || "Cinema Screening";
  const theatreName = show.theatre?.name || show.theatreName || "PVR Cinemas";
  const showDate = show.showDate || show.showdate || show.date;
  const showTime = show.showTime || show.showtime || "18:30";

  return (
    <div className="min-h-screen bg-brand-dark pb-24 text-white">

      {/* 1. Header Bar with Show Metadata */}
      <div className="bg-brand-card border-b border-brand-border sticky top-16 z-30 px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-brand-dark hover:bg-brand-border border border-brand-border rounded-lg text-xs"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                {movieTitle}
              </h1>
              <div className="flex items-center gap-3 text-xs text-brand-muted mt-0.5">
                <span className="flex items-center gap-1 text-brand-text">
                  <FaMapMarkerAlt className="w-3 h-3 text-brand-red" /> {theatreName}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3" /> {showDate}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 font-semibold text-white">
                  <FaClock className="w-3 h-3 text-amber-400" /> {showTime}
                </span>
              </div>
            </div>
          </div>

          {/* Seat Status Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-brand-card border border-brand-border rounded-sm" />
              <span className="text-brand-muted">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-brand-red rounded-sm" />
              <span className="text-white font-semibold">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-brand-border/40 border border-transparent rounded-sm" />
              <span className="text-brand-muted/50">Sold</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid & Checkout Split Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2 Columns: Cinema Screen & Seat Grid */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-8 flex flex-col items-center">

          {/* Cinema Screen Projection */}
          <div className="w-full max-w-lg mb-12 text-center">
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-brand-red to-transparent rounded-full shadow-[0_0_20px_rgba(229,9,20,0.8)] mb-2" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">
              All eyes this way &bull; Cinema Screen
            </span>
          </div>

          {/* Seating Grid by Tiers */}
          <div className="w-full space-y-8">

            {/* Balcony Tier */}
            {balconySeats.length > 0 && (
              <div>
                <div className="text-xs uppercase font-bold text-brand-muted tracking-wider border-b border-brand-border/60 pb-1 mb-4 flex justify-between">
                  <span>Balcony Tier</span>
                  <span className="text-amber-400 font-semibold">₹{balconySeats[0]?.price || 400}</span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-2.5 justify-center">
                  {balconySeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.seatNumber}
                        disabled={seat.isBooked}
                        onClick={() => handleSeatClick(seat.seatNumber, seat)}
                        className={`h-9 text-[11px] font-bold rounded-lg border transition-all duration-150 flex items-center justify-center ${seat.isBooked
                            ? "bg-brand-border/20 border-transparent text-brand-muted/30 cursor-not-allowed"
                            : isSelected
                              ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/50 scale-105"
                              : "bg-brand-dark/60 border-brand-border hover:border-brand-red text-brand-muted hover:text-white"
                          }`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Middle Tier */}
            {middleSeats.length > 0 && (
              <div>
                <div className="text-xs uppercase font-bold text-brand-muted tracking-wider border-b border-brand-border/60 pb-1 mb-4 flex justify-between">
                  <span>Middle Tier</span>
                  <span className="text-amber-400 font-semibold">₹{middleSeats[0]?.price || 250}</span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-2.5 justify-center">
                  {middleSeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.seatNumber}
                        disabled={seat.isBooked}
                        onClick={() => handleSeatClick(seat.seatNumber, seat)}
                        className={`h-9 text-[11px] font-bold rounded-lg border transition-all duration-150 flex items-center justify-center ${seat.isBooked
                            ? "bg-brand-border/20 border-transparent text-brand-muted/30 cursor-not-allowed"
                            : isSelected
                              ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/50 scale-105"
                              : "bg-brand-dark/60 border-brand-border hover:border-brand-red text-brand-muted hover:text-white"
                          }`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lower Tier */}
            {lowerSeats.length > 0 && (
              <div>
                <div className="text-xs uppercase font-bold text-brand-muted tracking-wider border-b border-brand-border/60 pb-1 mb-4 flex justify-between">
                  <span>Lower Tier</span>
                  <span className="text-amber-400 font-semibold">₹{lowerSeats[0]?.price || 150}</span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-2.5 justify-center">
                  {lowerSeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.seatNumber}
                        disabled={seat.isBooked}
                        onClick={() => handleSeatClick(seat.seatNumber, seat)}
                        className={`h-9 text-[11px] font-bold rounded-lg border transition-all duration-150 flex items-center justify-center ${seat.isBooked
                            ? "bg-brand-border/20 border-transparent text-brand-muted/30 cursor-not-allowed"
                            : isSelected
                              ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/50 scale-105"
                              : "bg-brand-dark/60 border-brand-border hover:border-brand-red text-brand-muted hover:text-white"
                          }`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right 1 Column: Reservation Summary & Payment Drawer */}
        <div className="space-y-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl sticky top-36">
            <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-brand-border">
              Booking Summary
            </h2>

            {/* Selected Seats Chips */}
            <div className="mb-4">
              <span className="text-xs text-brand-muted block mb-2 font-medium">
                Selected Seats ({selectedSeats.length})
              </span>
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-brand-red/15 border border-brand-red/40 text-brand-red text-xs font-bold rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-muted italic">
                  No seats selected yet. Click any seat on the grid to reserve.
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-4 border-t border-brand-border/60">
              <div className="flex justify-between text-brand-muted">
                <span>Tickets Subtotal</span>
                <span className="font-semibold text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Convenience Fee (8%)</span>
                <span className="font-semibold text-white">₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-brand-border">
                <span>Grand Total</span>
                <span className="text-brand-red">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-6 pt-4 border-t border-brand-border">
              <label className="text-xs font-semibold text-brand-muted block mb-2">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${paymentMethod === "UPI"
                      ? "bg-brand-red/20 border-brand-red text-white"
                      : "bg-brand-dark border-brand-border text-brand-muted"
                    }`}
                >
                  UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${paymentMethod === "CARD"
                      ? "bg-brand-red/20 border-brand-red text-white"
                      : "bg-brand-dark border-brand-border text-brand-muted"
                    }`}
                >
                  Debit / Credit Card
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={selectedSeats.length === 0 || bookingInProgress}
              className="w-full mt-6 py-3.5 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-red/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              {bookingInProgress ? (
                "Locking Seats & Confirming..."
              ) : (
                <>
                  <FaLock className="w-3.5 h-3.5" /> Pay & Book Now (₹{grandTotal})
                </>
              )}
            </button>

            <p className="text-[11px] text-brand-muted text-center mt-3">
              100% Safe & Secure Checkout &bull; M-Tickets dispatched instantly
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeatsPage;