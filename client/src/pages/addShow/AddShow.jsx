// client/src/pages/addShow/AddShow.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaArrowLeft, FaFilm, FaBuilding, FaClock, FaDollarSign } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const AddShow = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);

  const [formData, setFormData] = useState({
    movie: "",
    theatre: "",
    showDate: new Date().toISOString().split("T")[0],
    showTime: "18:30",
    ticketPrice: 250,
  });

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      setFetchingData(true);
      const [moviesRes, theatresRes] = await Promise.all([
        api.get("/movie"),
        api.get("/theatre"),
      ]);

      const movieList = moviesRes.data.movies || [];
      const theatreList = theatresRes.data.theatres || [];

      setMovies(movieList);
      setTheatres(theatreList);

      setFormData((prev) => ({
        ...prev,
        movie: movieList[0]?._id || "",
        theatre: theatreList[0]?._id || "",
      }));
    } catch (error) {
      toast.error("Could not load movies and theatres list.");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movie || !formData.theatre) {
      toast.error("Please select both a movie and a cinema theatre.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        movie: formData.movie,
        movieId: formData.movie,
        theatre: formData.theatre,
        theatreName: formData.theatre,
        showDate: formData.showDate,
        showdate: formData.showDate,
        date: formData.showDate,
        showTime: formData.showTime,
        showtime: formData.showTime,
        time: formData.showTime,
        ticketPrice: Number(formData.ticketPrice) || 250,
      };

      const res = await api.post("/shows/addshow", payload);
      if (res.data.status) {
        toast.success("Show scheduled and seat matrix populated successfully!");
        navigate("/admin");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to schedule show.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-white">
        <FaCalendarAlt className="w-10 h-10 text-amber-500 animate-pulse" />
        <p className="text-brand-muted text-sm">Loading available movies and theatres...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-20 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-border">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-brand-card hover:bg-brand-border border border-brand-border rounded-lg text-xs"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaCalendarAlt className="w-5 h-5 text-amber-400" /> Schedule Showtime Slot
            </h1>
            <p className="text-xs text-brand-muted">Bridge a movie feature with an auditorium and show timing</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">

          {/* Select Movie */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
              <FaFilm className="w-3 h-3 text-brand-red" /> Select Movie Title
            </label>
            <select
              name="movie"
              value={formData.movie}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-400 rounded-lg text-white text-sm outline-none"
            >
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title || m.movieName} ({m.certification || "UA"})
                </option>
              ))}
            </select>
          </div>

          {/* Select Theatre */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
              <FaBuilding className="w-3 h-3 text-sky-400" /> Select Cinema Venue
            </label>
            <select
              name="theatre"
              value={formData.theatre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-400 rounded-lg text-white text-sm outline-none"
            >
              {theatres.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name || t.theatreName} - {t.city || t.location}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Screen Date
              </label>
              <input
                type="date"
                name="showDate"
                value={formData.showDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-400 rounded-lg text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                <FaClock className="w-3 h-3 text-amber-400" /> Show Timing
              </label>
              <input
                type="time"
                name="showTime"
                value={formData.showTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-400 rounded-lg text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Base Admission Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
              <FaDollarSign className="w-3 h-3 text-emerald-400" /> Base Admission Price (₹)
            </label>
            <input
              type="number"
              name="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleChange}
              min={50}
              className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-400 rounded-lg text-white text-sm outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all text-sm mt-4"
          >
            {loading ? "Initializing Grid & Scheduling..." : "Schedule Showtime & Populate Seats"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddShow;