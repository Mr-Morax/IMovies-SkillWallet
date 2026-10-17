// client/src/components/navbar/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    FaFilm,
    FaHeart,
    FaTicketAlt,
    FaUser,
    FaSignOutAlt,
    FaShieldAlt,
    FaPlusCircle,
    FaBars,
    FaTimes,
    FaTachometerAlt
} from "react-icons/fa";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState(localStorage.getItem("jwtToken"));
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
    const navigate = useNavigate();
    const location = useLocation();

    // Re-sync authentication state on route changes
    useEffect(() => {
        setToken(localStorage.getItem("jwtToken"));
        setIsAdmin(localStorage.getItem("isAdmin") === "true");
        setIsOpen(false);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userEmail");
        setToken(null);
        setIsAdmin(false);
        navigate("/login");
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${isActive
            ? "text-brand-red font-semibold"
            : "text-brand-muted hover:text-brand-text"
        }`;

    return (
        <nav className="sticky top-0 z-50 w-full bg-brand-card/95 backdrop-blur-md border-b border-brand-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* 1. Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <FaFilm className="w-6 h-6 text-brand-red transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-xl font-black tracking-wider text-white">
                            i<span className="text-brand-red">MOVIES</span>
                        </span>
                    </Link>

                    {/* 2. Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <NavLink to="/home" className={navLinkClass}>
                            Home
                        </NavLink>

                        {/* Authenticated Customer Links */}
                        {token && !isAdmin && (
                            <>
                                <NavLink to="/bookings" className={navLinkClass}>
                                    <FaTicketAlt className="w-3.5 h-3.5" />
                                    My Bookings
                                </NavLink>
                                <NavLink to="/favoriteshows" className={navLinkClass}>
                                    <FaHeart className="w-3.5 h-3.5" />
                                    Favorites
                                </NavLink>
                                <NavLink to="/profile" className={navLinkClass}>
                                    <FaUser className="w-3.5 h-3.5" />
                                    Profile
                                </NavLink>
                            </>
                        )}

                        {/* Authenticated Admin Links */}
                        {token && isAdmin && (
                            <>
                                <NavLink to="/admin" className={navLinkClass}>
                                    <FaTachometerAlt className="w-3.5 h-3.5" />
                                    Dashboard
                                </NavLink>
                                <NavLink to="/admin/addmovie" className={navLinkClass}>
                                    <FaPlusCircle className="w-3.5 h-3.5" />
                                    Add Movie
                                </NavLink>
                                <NavLink to="/admin/addtheatre" className={navLinkClass}>
                                    <FaPlusCircle className="w-3.5 h-3.5" />
                                    Add Theatre
                                </NavLink>
                                <NavLink to="/admin/addshow" className={navLinkClass}>
                                    <FaPlusCircle className="w-3.5 h-3.5" />
                                    Add Show
                                </NavLink>
                            </>
                        )}
                    </div>

                    {/* 3. Auth Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {token ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-border/60 hover:bg-brand-red/90 text-white rounded-lg transition-all duration-200"
                            >
                                <FaSignOutAlt className="w-3.5 h-3.5" />
                                Logout
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-brand-text hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium bg-brand-red hover:bg-red-700 text-white rounded-lg shadow-lg shadow-brand-red/20 transition-all duration-200"
                                >
                                    Register
                                </Link>
                                <Link
                                    to="/login/admin"
                                    className="flex items-center gap-1.5 ml-2 px-2.5 py-1 text-xs font-semibold bg-brand-border/40 hover:bg-brand-border text-brand-muted hover:text-white rounded-md transition-all"
                                    title="Admin Access"
                                >
                                    <FaShieldAlt className="w-3 h-3 text-amber-500" />
                                    Admin
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 4. Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-brand-muted hover:text-white p-2 rounded-lg"
                            aria-label="Toggle Navigation"
                        >
                            {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Mobile Drawer */}
            {isOpen && (
                <div className="md:hidden border-t border-brand-border bg-brand-card px-4 pt-3 pb-6 space-y-3">
                    <NavLink to="/home" className={navLinkClass}>
                        Home
                    </NavLink>
                    {token && !isAdmin && (
                        <>
                            <NavLink to="/bookings" className={navLinkClass}>
                                <FaTicketAlt className="w-3.5 h-3.5" /> My Bookings
                            </NavLink>
                            <NavLink to="/favoriteshows" className={navLinkClass}>
                                <FaHeart className="w-3.5 h-3.5" /> Favorites
                            </NavLink>
                            <NavLink to="/profile" className={navLinkClass}>
                                <FaUser className="w-3.5 h-3.5" /> Profile
                            </NavLink>
                        </>
                    )}
                    {token && isAdmin && (
                        <>
                            <NavLink to="/admin" className={navLinkClass}>
                                <FaTachometerAlt className="w-3.5 h-3.5" /> Dashboard
                            </NavLink>
                            <NavLink to="/admin/addmovie" className={navLinkClass}>
                                <FaPlusCircle className="w-3.5 h-3.5" /> Add Movie
                            </NavLink>
                            <NavLink to="/admin/addtheatre" className={navLinkClass}>
                                <FaPlusCircle className="w-3.5 h-3.5" /> Add Theatre
                            </NavLink>
                            <NavLink to="/admin/addshow" className={navLinkClass}>
                                <FaPlusCircle className="w-3.5 h-3.5" /> Add Show
                            </NavLink>
                        </>
                    )}
                    <div className="pt-4 border-t border-brand-border/60">
                        {token ? (
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-border text-white text-sm font-medium rounded-lg"
                            >
                                <FaSignOutAlt className="w-3.5 h-3.5" /> Logout
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/login"
                                    className="w-full text-center py-2 text-sm font-medium bg-brand-border text-white rounded-lg"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="w-full text-center py-2 text-sm font-medium bg-brand-red text-white rounded-lg"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;