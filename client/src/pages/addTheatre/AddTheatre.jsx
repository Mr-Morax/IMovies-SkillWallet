// client/src/pages/addTheatre/AddTheatre.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaArrowLeft, FaMapMarkerAlt, FaChair, FaDollarSign } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const AddTheatre = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "Downtown",
    lowerSeats: 50,
    lowerSeatPrice: 150,
    middleSeats: 100,
    middleSeatPrice: 250,
    balconySeats: 30,
    balconySeatPrice: 400,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim()) {
      toast.error("Please provide both theatre name and city.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        theatreName: formData.name.trim(),
        city: formData.city.trim(),
        location: formData.city.trim(),
        lowerSeats: Number(formData.lowerSeats),
        lowerSeatPrice: Number(formData.lowerSeatPrice),
        middleSeats: Number(formData.middleSeats),
        middleSeatPrice: Number(formData.middleSeatPrice),
        balconySeats: Number(formData.balconySeats),
        balconySeatPrice: Number(formData.balconySeatPrice),
      };

      const res = await api.post("/theatre/addtheatre", payload);
      if (res.data.status) {
        toast.success(`Cinema "${formData.name}" registered successfully!`);
        navigate("/admin");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to register theatre.");
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
              <FaBuilding className="w-5 h-5 text-sky-400" /> Register Partner Cinema Hall
            </h1>
            <p className="text-xs text-brand-muted">Configure auditorium capacities and tiered seat pricing</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Cinema Hall Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. INOX Megaplex, PVR ICON"
                required
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-sky-400 rounded-lg text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                <FaMapMarkerAlt className="w-3 h-3 text-brand-red" /> City / Location
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. South Mall, City Center"
                required
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border focus:border-sky-400 rounded-lg text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Tier Configuration Divider */}
          <div className="pt-4 border-t border-brand-border/60">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-1.5">
              <FaChair className="w-3.5 h-3.5" /> Seating Capacity & Pricing Tiers
            </h2>

            {/* Lower Tier */}
            <div className="grid grid-cols-2 gap-4 mb-4 bg-brand-dark/50 p-4 rounded-xl border border-brand-border/40">
              <div>
                <label className="block text-xs text-brand-muted mb-1 font-semibold">Lower Tier Seats</label>
                <input
                  type="number"
                  name="lowerSeats"
                  value={formData.lowerSeats}
                  onChange={handleChange}
                  min={10}
                  className="w-full px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-muted mb-1 font-semibold">Lower Price (₹)</label>
                <input
                  type="number"
                  name="lowerSeatPrice"
                  value={formData.lowerSeatPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Middle Tier */}
            <div className="grid grid-cols-2 gap-4 mb-4 bg-brand-dark/50 p-4 rounded-xl border border-brand-border/40">
              <div>
                <label className="block text-xs text-brand-muted mb-1 font-semibold">Middle Tier Seats</label>
                <input
                  type="number"
                  name="middleSeats"
                  value={formData.middleSeats}
                  onChange={handleChange}
                  min={10}
                  className="w-full px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-muted mb-1 font-semibold">Middle Price (₹)</label>
                <input
                  type="number"
                  name="middleSeatPrice"
                  value={formData.middleSeatPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Balcony Tier */}
            <div className="grid grid-cols-2 gap-4 bg-brand-dark/50 p-4 rounded-xl border border-brand-border/40">
              <div>
                <label className="block text-xs text-brand-muted mb-1 font-semibold">Balcony Tier Seats</label>
                <input
                  type="number"
                  name="balconySeats"
                  value={formData.balconySeats}
                  onChange={handleChange}
                  min={10}
                  className="w-full px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-muted mb-1 font-semibold">Balcony Price (₹)</label>
                <input
                  type="number"
                  name="balconySeatPrice"
                  value={formData.balconySeatPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-white text-xs outline-none"
                />
              </div>
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 transition-all text-sm mt-4"
          >
            {loading ? "Registering Venue..." : "Register Cinema Theatre"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddTheatre;