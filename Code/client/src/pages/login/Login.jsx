// client/src/pages/login/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaFilm } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = location.state?.from?.pathname || "/home";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.status) {
        toast.success(response.data.msg || "Login Successful!");

        // Store session tokens
        localStorage.setItem("jwtToken", response.data.jwtToken);
        localStorage.setItem("userEmail", response.data.userDetails.email);
        localStorage.setItem("username", response.data.userDetails.username);
        localStorage.setItem("isAdmin", "false");

        // Navigate to intended target route or home
        navigate(redirectTarget, { replace: true });
      } else {
        toast.error(response.data.msg || "Invalid credentials.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Login failed. Please check your connection.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-brand-dark">
      <div className="max-w-md w-full bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-red/10 rounded-xl mb-3">
            <FaFilm className="w-6 h-6 text-brand-red" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-brand-muted mt-1">
            Sign in to access your movie tickets and watchlist
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Email Address
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
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-lg text-white placeholder-brand-muted text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
              Password
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
                className="w-full pl-10 pr-10 py-2.5 bg-brand-dark border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-lg text-white placeholder-brand-muted text-sm outline-none transition-all"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-brand-red/20 transition-all duration-200 text-sm"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-brand-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-red hover:underline font-medium">
              Create Account
            </Link>
          </p>
          <div className="pt-3 border-t border-brand-border/60">
            <Link
              to="/login/admin"
              className="text-xs text-brand-muted hover:text-white transition-colors"
            >
              Are you an administrator? Sign in here &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;