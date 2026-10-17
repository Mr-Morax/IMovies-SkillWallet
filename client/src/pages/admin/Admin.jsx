// client/src/pages/admin/Admin.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaDollarSign,
  FaTicketAlt,
  FaFilm,
  FaBuilding,
  FaCalendarAlt,
  FaPlus,
  FaTrashAlt,
  FaChartLine
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const Admin = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalMovies: 0,
    totalTheatres: 0,
    totalShows: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      const [bookingsRes, moviesRes, theatresRes, showsRes] = await Promise.all([
        api.get("/bookings/all").catch(() => ({ data: { bookings: [] } })),
        api.get("/movie").catch(() => ({ data: { movies: [] } })),
        api.get("/theatre").catch(() => ({ data: { theatres: [] } })),
        api.get("/shows").catch(() => ({ data: { shows: [] } })),
      ]);

      const bookings = bookingsRes.data.bookings || [];
      const movies = moviesRes.data.movies || [];
      const theatres = theatresRes.data.theatres || [];
      const shows = showsRes.data.shows || [];

      // Calculate Gross Revenue from confirmed tickets
      const revenue = bookings.reduce((sum, b) => {
        const isCancelled = b.bookingStatus === "CANCELLED" || b.status === "CANCELLED";
        return isCancelled ? sum : sum + (b.totalAmount || b.amount || 0);
      }, 0);

      setStats({
        totalRevenue: revenue,
        totalBookings: bookings.length,
        totalMovies: movies.length,
        totalTheatres: theatres.length,
        totalShows: shows.length,
      });

      setRecentBookings(bookings.slice(0, 6));
      setMoviesList(movies);
      setTheatresList(theatres);
    } catch (error) {
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (movieId, movieTitle) => {
    if (!window.confirm(`Delete movie "${movieTitle}"? This will cancel its active shows.`)) return;
    try {
      const res = await api.delete(`/movie/${movieId}`);
      if (res.data.status) {
        toast.success(`Movie "${movieTitle}" deleted.`);
        setMoviesList((prev) => prev.filter((m) => (m._id || m.movieId) !== movieId));
        setStats((prev) => ({ ...prev, totalMovies: prev.totalMovies - 1 }));
      }
    } catch (error) {
      toast.error("Failed to delete movie.");
    }
  };

  const handleDeleteTheatre = async (theatreId, theatreName) => {
    if (!window.confirm(`Delete cinema "${theatreName}"?`)) return;
    try {
      const res = await api.delete(`/theatre/${theatreId}`);
      if (res.data.status) {
        toast.success(`Theatre "${theatreName}" deleted.`);
        setTheatresList((prev) => prev.filter((t) => (t._id || t.theatreId) !== theatreId));
        setStats((prev) => ({ ...prev, totalTheatres: prev.totalTheatres - 1 }));
      }
    } catch (error) {
      toast.error("Failed to delete theatre.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <FaChartLine className="w-10 h-10 text-amber-500 animate-pulse" />
        <p className="text-brand-muted text-sm tracking-wide">Aggregating platform revenue & catalog metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <FaChartLine className="w-6 h-6" />
              </span>
              Platform Management Dashboard
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Live box-office revenue, booking ledgers, and cinema hall management
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/addmovie"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-red hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-red/20 transition-all"
            >
              <FaPlus className="w-3 h-3" /> Add Movie
            </Link>
            <Link
              to="/admin/addtheatre"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-card hover:bg-brand-border border border-brand-border text-white font-bold text-xs rounded-xl transition-all"
            >
              <FaPlus className="w-3 h-3" /> Add Theatre
            </Link>
            <Link
              to="/admin/addshow"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-card hover:bg-brand-border border border-brand-border text-white font-bold text-xs rounded-xl transition-all"
            >
              <FaCalendarAlt className="w-3 h-3 text-amber-400" /> Schedule Show
            </Link>
          </div>
        </div>

        {/* 1. Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

          {/* Revenue */}
          <div className="bg-brand-card border border-brand-border p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
              <FaDollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">
              &uarr; Live Transaction Ledger
            </span>
          </div>

          {/* Tickets Sold */}
          <div className="bg-brand-card border border-brand-border p-5 rounded-2xl">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <FaTicketAlt className="w-4 h-4 text-brand-red" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalBookings}</p>
            <span className="text-[10px] text-brand-muted font-medium mt-1 inline-block">
              Confirmed Reservations
            </span>
          </div>

          {/* Active Movies */}
          <div className="bg-brand-card border border-brand-border p-5 rounded-2xl">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Movies</span>
              <FaFilm className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalMovies}</p>
            <span className="text-[10px] text-brand-muted font-medium mt-1 inline-block">
              Now Showing Titles
            </span>
          </div>

          {/* Cinema Theatres */}
          <div className="bg-brand-card border border-brand-border p-5 rounded-2xl">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Partner Venues</span>
              <FaBuilding className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalTheatres}</p>
            <span className="text-[10px] text-brand-muted font-medium mt-1 inline-block">
              {stats.totalShows} Scheduled Screenings
            </span>
          </div>

        </div>

        {/* 2. Recent Transactions Table */}
        <div className="mt-10 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-brand-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Customer Bookings</h2>
              <p className="text-xs text-brand-muted">Latest ticket reservations across all theaters</p>
            </div>
            <span className="text-xs text-brand-muted font-mono">{recentBookings.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-dark/60 text-brand-muted uppercase font-semibold border-b border-brand-border/60">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Customer Email</th>
                  <th className="py-3.5 px-4">Movie</th>
                  <th className="py-3.5 px-4">Seats</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-brand-text">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-brand-muted">
                      No bookings recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => {
                    const isCancelled = b.bookingStatus === "CANCELLED" || b.status === "CANCELLED";
                    const movieTitle =
                      b.show?.movie?.title || b.show?.movie?.movieName || "Cinema Screening";
                    const seats = Array.isArray(b.seats) ? b.seats.join(", ") : Object.keys(b.ticketsData || {}).join(", ");

                    return (
                      <tr key={b._id || b.bookingId} className="hover:bg-brand-dark/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-white">
                          {b.bookingId || b._id.substring(0, 10)}
                        </td>
                        <td className="py-3.5 px-4 text-brand-muted">{b.userEmail}</td>
                        <td className="py-3.5 px-4 font-semibold text-white">{movieTitle}</td>
                        <td className="py-3.5 px-4 font-mono text-brand-red font-bold">{seats}</td>
                        <td className="py-3.5 px-4 font-extrabold text-white">₹{b.totalAmount || b.amount || 250}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCancelled
                                ? "bg-rose-950/60 border border-rose-800 text-rose-400"
                                : "bg-emerald-950/60 border border-emerald-800 text-emerald-400"
                              }`}
                          >
                            {isCancelled ? "CANCELLED" : "CONFIRMED"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Catalog Inventory Summary (Movies & Theatres) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

          {/* Active Movies List */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border/60">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FaFilm className="w-4 h-4 text-brand-red" /> Active Movies Catalog ({moviesList.length})
              </h3>
              <Link to="/admin/addmovie" className="text-xs text-brand-red hover:underline font-semibold">
                + Add Title
              </Link>
            </div>

            <div className="space-y-3">
              {moviesList.map((m) => (
                <div
                  key={m._id || m.movieId}
                  className="flex items-center justify-between p-3 bg-brand-dark/50 border border-brand-border/60 rounded-xl text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{m.title || m.movieName}</h4>
                    <p className="text-brand-muted text-[11px]">
                      {m.duration || m.runtime} mins &bull; {m.certification || "UA"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMovie(m._id || m.movieId, m.title || m.movieName)}
                    className="p-2 text-brand-muted hover:text-rose-400 transition-colors"
                    title="Delete Movie"
                  >
                    <FaTrashAlt className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Theatres List */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border/60">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FaBuilding className="w-4 h-4 text-sky-400" /> Registered Theatres ({theatresList.length})
              </h3>
              <Link to="/admin/addtheatre" className="text-xs text-sky-400 hover:underline font-semibold">
                + Add Venue
              </Link>
            </div>

            <div className="space-y-3">
              {theatresList.map((t) => (
                <div
                  key={t._id || t.theatreId}
                  className="flex items-center justify-between p-3 bg-brand-dark/50 border border-brand-border/60 rounded-xl text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{t.name || t.theatreName}</h4>
                    <p className="text-brand-muted text-[11px]">{t.city || t.location}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTheatre(t._id || t.theatreId, t.name || t.theatreName)}
                    className="p-2 text-brand-muted hover:text-rose-400 transition-colors"
                    title="Delete Theatre"
                  >
                    <FaTrashAlt className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Admin;