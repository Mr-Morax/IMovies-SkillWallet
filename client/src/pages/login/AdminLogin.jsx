// client/src/pages/login/AdminLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please provide admin credentials.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/admin/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.status) {
        toast.success(response.data.msg || "Admin Access Granted");

        // Set Admin Session Keys
        localStorage.setItem("jwtToken", response.data.jwtToken);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem(
          "userEmail",
          response.data.adminDetails?.email || formData.email
        );
        localStorage.setItem(
          "username",
          response.data.adminDetails?.username || "Administrator"
        );

        navigate("/admin", { replace: true });
      } else {
        toast.error(response.data.msg || "Invalid admin credentials.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Admin authentication failed.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-brand-dark">
      <div className="max-w-md w-full bg-brand-card border border-amber-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

        {/* Amber Admin Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-3">
            <FaShieldAlt className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-brand-muted mt-1">
            Authorized management credentials required
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                <FaEnvelope className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@imovies.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-white placeholder-brand-muted text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Master Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                <FaLock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-white placeholder-brand-muted text-sm outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-white"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-amber-600/20 transition-all duration-200 text-sm"
          >
            {loading ? "Authenticating Admin..." : "Authenticate Admin"}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center pt-4 border-t border-brand-border/60">
          <Link to="/login" className="text-xs text-brand-muted hover:text-white transition-colors">
            &larr; Switch to Customer Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;