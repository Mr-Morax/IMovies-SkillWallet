// client/src/pages/favoriteShows/FavoriteShows.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaTrashAlt,
  FaTicketAlt,
  FaClock,
  FaStar,
  FaFilm,
  FaArrowRight
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const FavoriteShows = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchFavorites();
  }, [userEmail]);

  const fetchFavorites = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/favorite/myfavorites?email=${userEmail}`);
      if (res.data.status && Array.isArray(res.data.favorites)) {
        setFavorites(res.data.favorites);
      }
    } catch (error) {
      toast.error("Could not load your watchlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (e, fav) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = fav._id || fav.movieId;
    const movieTitle = fav.movie?.title || fav.movieDetails?.title || "Movie";

    setDeletingId(targetId);
    try {
      const res = await api.delete(`/favorite/${targetId}`);
      if (res.data.status) {
        toast.success(`Removed "${movieTitle}" from your watchlist.`);
        setFavorites((prev) => prev.filter((f) => (f._id || f.movieId) !== targetId));
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to remove movie from watchlist.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <FaHeart className="w-10 h-10 text-brand-red animate-pulse" />
        <p className="text-brand-muted text-sm tracking-wide">Loading your saved movies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Page Header */}
        <div className="flex items-center justify-between pb-6 border-b border-brand-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <FaHeart className="w-6 h-6 text-brand-red" /> My Movie Watchlist
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Keep track of films you want to watch and book tickets before seats sell out
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-brand-card border border-brand-border rounded-full text-brand-muted">
            {favorites.length} Saved Title(s)
          </span>
        </div>

        {/* Watchlist Grid */}
        <div className="mt-8">
          {favorites.length === 0 ? (
            <div className="text-center py-20 bg-brand-card/40 border border-brand-border rounded-2xl p-8 max-w-lg mx-auto">
              <FaFilm className="w-12 h-12 text-brand-muted mx-auto mb-3 opacity-30" />
              <h2 className="text-lg font-bold text-white">Your Watchlist is Empty</h2>
              <p className="text-xs text-brand-muted mt-1 mb-6">
                Click the heart icon on any movie poster across the catalog to save upcoming releases and now-showing features!
              </p>
              <Link
                to="/home"
                className="px-6 py-2.5 bg-brand-red hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all inline-flex items-center gap-2"
              >
                Browse Now Showing <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((fav) => {
                const movieData = fav.movie || fav.movieDetails || {};
                const movieId = movieData._id || fav.movieId;
                const title = movieData.title || movieData.movieName || "Featured Title";
                const posterUrl =
                  movieData.poster ||
                  movieData.media ||
                  "https://images.unsplash.com/photo-1534447677768-be436bb09401";
                const duration = movieData.duration || movieData.runtime || 120;
                const certification = movieData.certification || "UA";
                const genres = Array.isArray(movieData.genres)
                  ? movieData.genres.join(", ")
                  : movieData.genres || "Cinema";

                const isRemoving = deletingId === (fav._id || fav.movieId);

                return (
                  <div
                    key={fav._id || fav.movieId}
                    className="group relative bg-brand-card border border-brand-border hover:border-brand-red/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Poster */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-brand-dark">
                        <img
                          src={posterUrl}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Certification Badge */}
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold rounded">
                          {certification}
                        </span>

                        {/* Remove Action Button */}
                        <button
                          onClick={(e) => handleRemoveFavorite(e, fav)}
                          disabled={isRemoving}
                          className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-rose-600 backdrop-blur-md rounded-full text-white transition-all shadow-md"
                          title="Remove from Watchlist"
                        >
                          <FaTrashAlt className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Movie Information */}
                      <div className="p-4">
                        <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-brand-red transition-colors">
                          {title}
                        </h3>
                        <p className="text-xs text-brand-muted mt-0.5 line-clamp-1">
                          {genres}
                        </p>

                        <div className="flex items-center gap-3 pt-3 mt-3 border-t border-brand-border/60 text-xs text-brand-muted">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <FaStar className="w-3 h-3" /> 4.8
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" /> {duration}m
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Booking CTA */}
                    <div className="p-4 pt-0">
                      <Link
                        to={`/moviedetails/${movieId}`}
                        className="w-full py-2.5 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl text-center text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FaTicketAlt className="w-3 h-3" /> View Showtimes
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FavoriteShows;