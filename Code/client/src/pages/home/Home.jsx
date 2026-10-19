// client/src/pages/home/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaStar,
  FaClock,
  FaHeart,
  FaTicketAlt,
  FaFilm,
  FaPlay
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const GENRES = ["All", "Action", "Sci-Fi", "Adventure", "Drama", "Comedy", "Thriller"];

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/movie");
      if (res.data.status && Array.isArray(res.data.movies)) {
        setMovies(res.data.movies);
      }
    } catch (error) {
      toast.error("Failed to load movies. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (e, movie) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userEmail) {
      toast.info("Please sign in to save movies to your watchlist!");
      return;
    }

    try {
      const res = await api.post("/favorite/add", {
        userEmail,
        movieId: movie._id || movie.movieId,
      });

      if (res.data.status) {
        toast.success(`Added "${movie.title || movie.movieName}" to your Favorites!`);
      }
    } catch (error) {
      const msg = error.response?.data?.msg || "Could not add to favorites.";
      toast.info(msg);
    }
  };

  // Filter movies by search query and category
  const filteredMovies = movies.filter((movie) => {
    const title = (movie.title || movie.movieName || "").toLowerCase();
    const genres = (Array.isArray(movie.genres) ? movie.genres.join(" ") : movie.genres || "").toLowerCase();

    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || genres.includes(selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  // Featured Hero Movie (first item or fallback)
  const featuredMovie = movies[0];

  return (
    <div className="min-h-screen bg-brand-dark pb-16">

      {/* 1. Hero Movie Spotlight Banner */}
      {featuredMovie && (
        <div className="relative w-full h-[460px] bg-brand-card overflow-hidden border-b border-brand-border">
          {/* Backdrop Image with Gradient Overlays */}
          <img
            src={featuredMovie.poster || featuredMovie.media || "https://images.unsplash.com/photo-1534447677768-be436bb09401"}
            alt={featuredMovie.title || featuredMovie.movieName}
            className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />

          {/* Banner Content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block px-3 py-1 bg-brand-red text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-brand-red/30">
                Featured Release
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {featuredMovie.title || featuredMovie.movieName}
              </h1>
              <p className="text-sm sm:text-base text-brand-muted line-clamp-3 leading-relaxed">
                {featuredMovie.description}
              </p>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-brand-muted font-medium pt-2">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <FaStar className="w-4 h-4" /> 4.9 Rating
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="w-3.5 h-3.5" />
                  {featuredMovie.duration || featuredMovie.runtime || 169} mins
                </span>
                <span>&bull;</span>
                <span className="px-2 py-0.5 border border-brand-border rounded text-brand-text">
                  {featuredMovie.certification || "UA"}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Link
                  to={`/moviedetails/${featuredMovie._id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl shadow-xl shadow-brand-red/30 transition-all duration-200 text-sm"
                >
                  <FaTicketAlt className="w-4 h-4" /> Book Tickets
                </Link>
                <button
                  onClick={(e) => handleAddFavorite(e, featuredMovie)}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-brand-border/60 hover:bg-brand-border text-white font-semibold rounded-xl transition-all duration-200 text-sm"
                >
                  <FaHeart className="w-4 h-4 text-rose-500" /> Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Controls: Search Bar & Genre Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Genre Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${selectedGenre === genre
                    ? "bg-brand-red text-white shadow-lg shadow-brand-red/25"
                    : "bg-brand-card hover:bg-brand-border/60 text-brand-muted hover:text-white border border-brand-border"
                  }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[280px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
              <FaSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search movie titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-card border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl text-white placeholder-brand-muted text-xs outline-none transition-all"
            />
          </div>

        </div>

        {/* 3. Section Title */}
        <div className="flex items-center justify-between mt-10 mb-6">
          <div className="flex items-center gap-2">
            <FaFilm className="w-5 h-5 text-brand-red" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              {selectedGenre === "All" ? "Now Showing" : `${selectedGenre} Movies`}
            </h2>
          </div>
          <span className="text-xs text-brand-muted font-medium">
            Showing {filteredMovies.length} title(s)
          </span>
        </div>

        {/* 4. Movie Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-brand-card/40 border border-brand-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-brand-card/30 border border-brand-border rounded-2xl">
            <FaFilm className="w-12 h-12 text-brand-muted mx-auto mb-3 opacity-40" />
            <p className="text-lg font-bold text-white">No movies found</p>
            <p className="text-sm text-brand-muted mt-1">
              Try adjusting your search query or selecting a different genre.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => {
              const movieId = movie._id || movie.movieId;
              const posterUrl = movie.poster || movie.media || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba";
              const title = movie.title || movie.movieName;

              return (
                <div
                  key={movieId}
                  className="group relative bg-brand-card border border-brand-border hover:border-brand-red/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-brand-red/10 flex flex-col"
                >
                  {/* Poster Image Container */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-brand-dark">
                    <img
                      src={posterUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Certification Badge */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold rounded">
                      {movie.certification || "UA"}
                    </span>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleAddFavorite(e, movie)}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-rose-600 backdrop-blur-md rounded-full text-white transition-all duration-200"
                      title="Add to Watchlist"
                    >
                      <FaHeart className="w-3.5 h-3.5" />
                    </button>

                    {/* Hover Overlay CTA */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Link
                        to={`/moviedetails/${movieId}`}
                        className="w-full py-2.5 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl text-center text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FaTicketAlt className="w-3 h-3" /> Book Now
                      </Link>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-brand-red transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs text-brand-muted mt-1 line-clamp-1">
                        {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres || "Cinema"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-brand-border/60 text-xs text-brand-muted font-medium">
                      <span className="flex items-center gap-1 text-amber-400">
                        <FaStar className="w-3 h-3" /> 4.8
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {movie.duration || movie.runtime || 120}m
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;