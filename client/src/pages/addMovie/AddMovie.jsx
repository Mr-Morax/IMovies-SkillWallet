// client/src/pages/addMovie/AddMovie.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaFilm, FaArrowLeft, FaClock, FaCalendarAlt, FaImage, FaTag } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const AddMovie = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genres: "Action, Sci-Fi",
    releaseDate: new Date().toISOString().split("T")[0],
    duration: 145,
    certification: "UA",
    poster: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in movie title and description.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        movieName: formData.title.trim(),
        description: formData.description.trim(),
        genres: formData.genres,
        releaseDate: formData.releaseDate,
        duration: Number(formData.duration) || 120,
        runtime: Number(formData.duration) || 120,
        certification: formData.certification,
        poster:
          formData.poster.trim() ||
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
        media:
          formData.poster.trim() ||
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
      };

      const res = await api.post("/movie/addmovie", payload);
      if (res.data.status) {
        toast.success(`Movie "${formData.title}" added to catalog!`);
        navigate("/admin");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to add movie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark pb-20 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">

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
              <FaFilm className="w-5 h-5 text-brand-red" /> Add New Movie Feature
            </h1>
            <p className="text-xs text-brand-muted">Publish a new film to the now-showing catalog</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Movie Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Oppenheimer, Dune: Part Two"
              required
              className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-lg text-white text-sm outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Synopsis & Description
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a compelling synopsis of the film..."
              required
              className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-lg text-white text-sm outline-none"
            />
          </div>

          {/* Genres & Certification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                <FaTag className="w-3 h-3 text-brand-red" /> Genres (Comma Separated)
              </label>
              <input
                type="text"
                name="genres"
                value={formData.genres}
                onChange={handleChange}
                placeholder="Sci-Fi, Adventure, Drama"
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red rounded-lg text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Certification Rating
              </label>
              <select
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red rounded-lg text-white text-sm outline-none"
              >
                <option value="U">U (Universal - All Ages)</option>
                <option value="UA">UA (Parental Guidance 12+)</option>
                <option value="A">A (Adults 18+)</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R (Restricted)</option>
              </select>
            </div>
          </div>

          {/* Runtime & Release Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                <FaClock className="w-3 h-3 text-amber-400" /> Runtime (Minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={30}
                max={300}
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red rounded-lg text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                <FaCalendarAlt className="w-3 h-3 text-sky-400" /> Release Date
              </label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red rounded-lg text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Poster URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
              <FaImage className="w-3 h-3 text-brand-red" /> Poster Image URL
            </label>
            <input
              type="url"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red rounded-lg text-white text-sm outline-none"
            />
            <p className="text-[11px] text-brand-muted mt-1">
              Leave blank to use the high-resolution cinema backdrop default.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-red/25 transition-all text-sm mt-4"
          >
            {loading ? "Publishing Title..." : "Publish Movie to Catalog"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddMovie;