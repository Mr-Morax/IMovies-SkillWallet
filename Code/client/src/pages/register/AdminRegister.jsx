// client/src/pages/register/AdminRegister.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username.trim() || !email.trim() || !password) {
      toast.error("Please fill in all administrator credentials.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/admin/register", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.status) {
        toast.success(response.data.msg || "Admin Account Registered Successfully!");

        // Set Admin Session Keys
        localStorage.setItem("jwtToken", response.data.jwtToken);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem(
          "userEmail",
          response.data.adminDetails?.email || email.trim().toLowerCase()
        );
        localStorage.setItem(
          "username",
          response.data.adminDetails?.username || username.trim()
        );

        navigate("/admin", { replace: true });
      } else {
        toast.error(response.data.msg || "Admin registration failed.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Register Administrator</h1>
          <p className="text-sm text-brand-muted mt-1">
            Create a master administrative account to manage cinema operations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Admin Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                <FaUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Alex Vance"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-white placeholder-brand-muted text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Admin Email Address
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
                placeholder="alex.admin@imovies.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-white placeholder-brand-muted text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Confirm Master Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                <FaLock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-white placeholder-brand-muted text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-amber-600/20 transition-all duration-200 text-sm"
          >
            {loading ? "Registering Admin..." : "Create Admin Account"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-brand-muted">
            Already registered as an admin?{" "}
            <Link to="/login/admin" className="text-amber-400 hover:underline font-medium">
              Sign In to Portal
            </Link>
          </p>
          <div className="pt-3 border-t border-brand-border/60">
            <Link to="/login" className="text-xs text-brand-muted hover:text-white transition-colors">
              &larr; Switch to Customer Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminRegister;