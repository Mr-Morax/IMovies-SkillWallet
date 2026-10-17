// client/src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



import UserProtection from "./components/protection/UserProtection";
import AdminProtection from "./components/protection/AdminProtection";
import Loader from "./components/loader/Loader";
import Navbar from "./components/navbar/Navbar";

// Lazy-loaded Customer Pages
const Landing = lazy(() => import("./pages/landing/Landing"));
const Login = lazy(() => import("./pages/login/Login"));
const Register = lazy(() => import("./pages/register/Register"));
const Home = lazy(() => import("./pages/home/Home"));
const MovieDetails = lazy(() => import("./pages/movieDetails/MovieDetails"));
const MovieShows = lazy(() => import("./pages/movieShows/MovieShows"));
const SeatsPage = lazy(() => import("./pages/seatsPage/SeatsPage"));
const Bookings = lazy(() => import("./pages/bookings/Bookings"));
const FavoriteShows = lazy(() => import("./pages/favoriteShows/FavoriteShows"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const EditUserDetails = lazy(() => import("./pages/editUserDetails/EditUserDetails"));

// Lazy-loaded Admin Pages
const AdminLogin = lazy(() => import("./pages/login/AdminLogin"));
const AdminRegister = lazy(() => import("./pages/register/AdminRegister"));
const Admin = lazy(() => import("./pages/admin/Admin"));
const AddMovie = lazy(() => import("./pages/addMovie/AddMovie"));
const AddTheatre = lazy(() => import("./pages/addTheatre/AddTheatre"));
const AddShow = lazy(() => import("./pages/addShow/AddShow"));
const AdminBookings = lazy(() => import("./pages/adminBookings/AdminBookings"));

const App = () => {
  return (
    <BrowserRouter>

      {/* 1. Global Navigation Bar */}
      <Navbar />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-brand-dark">
            <Loader />
          </div>
        }
      >
        <Routes>
          {/* Public Customer Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/moviedetails/:id" element={<MovieDetails />} />
          <Route path="/movieshows/:id" element={<MovieShows />} />

          {/* Protected Customer Routes */}
          <Route
            path="/seatspage/:id"
            element={
              <UserProtection>
                <SeatsPage />
              </UserProtection>
            }
          />
          <Route
            path="/bookings"
            element={
              <UserProtection>
                <Bookings />
              </UserProtection>
            }
          />
          <Route
            path="/favoriteshows"
            element={
              <UserProtection>
                <FavoriteShows />
              </UserProtection>
            }
          />
          <Route
            path="/profile"
            element={
              <UserProtection>
                <Profile />
              </UserProtection>
            }
          />
          <Route
            path="/edituserdetails"
            element={
              <UserProtection>
                <EditUserDetails />
              </UserProtection>
            }
          />

          {/* Admin Auth Routes */}
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/register/admin" element={<AdminRegister />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtection>
                <Admin />
              </AdminProtection>
            }
          />
          <Route
            path="/admin/addmovie"
            element={
              <AdminProtection>
                <AddMovie />
              </AdminProtection>
            }
          />
          <Route
            path="/admin/addtheatre"
            element={
              <AdminProtection>
                <AddTheatre />
              </AdminProtection>
            }
          />
          <Route
            path="/admin/addshow"
            element={
              <AdminProtection>
                <AddShow />
              </AdminProtection>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminProtection>
                <AdminBookings />
              </AdminProtection>
            }
          />

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;