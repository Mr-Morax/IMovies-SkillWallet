// client/src/pages/movieDetails/MovieDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaHeart,
  FaCommentDots,
  FaArrowLeft,
  FaFilm
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);

  // Review submission state
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const userEmail = localStorage.getItem("userEmail");
  const username = localStorage.getItem("username");

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Movie Metadata
      const movieRes = await api.get(`/movie/${id}`);
      if (movieRes.data.status) {
        setMovie(movieRes.data.movie);
      }

      // 2. Fetch Scheduled Shows for this movie
      const showsRes = await api.get(`/shows?movieId=${id}`);
      if (showsRes.data.status && Array.isArray(showsRes.data.shows)) {
        const showList = showsRes.data.shows;
        setShows(showList);

        // Extract distinct show dates
        const dates = [
          ...new Set(showList.map((s) => s.showDate || s.showdate || s.date).filter(Boolean)),
        ];

        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }

      // 3. Fetch Reviews
      const reviewRes = await api.get(`/review/movie/${id}`);
      if (reviewRes.data.status) {
        setReviews(reviewRes.data.reviews || []);
        setAverageRating(reviewRes.data.averageRating || 0);
      }
    } catch (error) {
      toast.error("Could not load movie details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!userEmail) {
      toast.info("Please sign in to save movies to your watchlist.");
      return;
    }
    try {
      const res = await api.post("/favorite/add", {
        userEmail,
        movieId: movie._id,
      });
      if (res.data.status) {
        toast.success("Added to your Watchlist!");
      }
    } catch (error) {
      toast.info(error.response?.data?.msg || "Already in your watchlist.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      toast.info("Please sign in to write a review.");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please enter review comments.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post("/review/addreview", {
        movieId: movie._id,
        userEmail,
        email: userEmail,
        username: username || "Customer",
        rating: reviewRating,
        review: reviewText.trim(),
      });

      if (res.data.status) {
        toast.success("Review submitted successfully!");
        setReviewText("");
        // Refresh reviews
        const reviewRes = await api.get(`/review/movie/${id}`);
        if (reviewRes.data.status) {
          setReviews(reviewRes.data.reviews || []);
          setAverageRating(reviewRes.data.averageRating || 0);
        }
      }
    } catch (error) {
      toast.error("Could not post review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <FaFilm className="w-10 h-10 text-brand-red animate-pulse" />
        <p className="text-brand-muted text-sm tracking-wide">Loading movie details & showtimes...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <Link to="/home" className="text-brand-red hover:underline text-sm mt-3 inline-block">
          &larr; Return to Catalog
        </Link>
      </div>
    );
  }

  // Group shows on the selected date by Theatre
  const showsOnSelectedDate = shows.filter(
    (s) => (s.showDate || s.showdate || s.date) === selectedDate
  );

  const theatreMap = {};
  showsOnSelectedDate.forEach((show) => {
    const tName = show.theatreName || (show.theatre && show.theatre.name) || "Cinema Hall";
    if (!theatreMap[tName]) {
      theatreMap[tName] = {
        name: tName,
        location: (show.theatre && (show.theatre.city || show.theatre.location)) || "Downtown",
        shows: [],
      };
    }
    theatreMap[tName].shows.push(show);
  });

  const posterUrl = movie.poster || movie.media || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba";
  const title = movie.title || movie.movieName;

  return (
    <div className="min-h-screen bg-brand-dark pb-20">

      {/* 1. Backdrop Banner */}
      <div className="relative w-full h-[380px] overflow-hidden bg-brand-card border-b border-brand-border">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover filter blur-md opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-card/80 hover:bg-brand-border border border-brand-border rounded-lg text-white text-xs font-semibold backdrop-blur-md transition-all"
          >
            <FaArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>
      </div>

      {/* 2. Hero Information Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Movie Poster */}
          <div className="w-56 sm:w-64 shrink-0 rounded-2xl overflow-hidden border-2 border-brand-border shadow-2xl bg-brand-card">
            <img src={posterUrl} alt={title} className="w-full aspect-[2/3] object-cover" />
          </div>

          {/* Metadata Block */}
          <div className="flex-1 space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-brand-red text-white text-xs font-bold rounded uppercase">
                {movie.certification || "UA"}
              </span>
              <span className="px-2.5 py-0.5 bg-brand-card border border-brand-border text-brand-muted text-xs font-medium rounded">
                {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-brand-muted font-medium">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <FaStar className="w-4 h-4" /> {averageRating > 0 ? averageRating : "4.8"} / 5
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <FaClock className="w-3.5 h-3.5" /> {movie.duration || movie.runtime || 120} mins
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="w-3.5 h-3.5" /> {new Date(movie.releaseDate).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-brand-muted leading-relaxed max-w-3xl pt-1">
              {movie.description}
            </p>

            <div className="pt-2">
              <button
                onClick={handleAddFavorite}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-card hover:bg-brand-border border border-brand-border text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
              >
                <FaHeart className="w-3.5 h-3.5 text-rose-500" /> Save to Watchlist
              </button>
            </div>
          </div>
        </div>

        {/* 3. Showtime Booking Section */}
        <div className="mt-14 pt-8 border-t border-brand-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaTicketAlt className="w-5 h-5 text-brand-red" /> Select Date & Showtimes
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Choose a cinema hall and time slot to view available seats
              </p>
            </div>
          </div>

          {/* Date Selector Tabs */}
          {availableDates.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
              {availableDates.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[90px] py-2.5 px-4 rounded-xl border transition-all duration-200 ${isSelected
                        ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/30"
                        : "bg-brand-card border-brand-border text-brand-muted hover:text-white hover:border-brand-border/80"
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {dateObj.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className="text-base font-extrabold my-0.5">
                      {dateObj.getDate()}
                    </span>
                    <span className="text-[10px] uppercase font-semibold">
                      {dateObj.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-brand-card/40 border border-brand-border rounded-xl text-center text-brand-muted text-sm">
              No show schedules currently published for this title. Check back soon!
            </div>
          )}

          {/* Theatre Showtimes Grid */}
          <div className="mt-6 space-y-4">
            {Object.keys(theatreMap).length > 0 ? (
              Object.values(theatreMap).map((theatre) => (
                <div
                  key={theatre.name}
                  className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Theatre Info */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      {theatre.name}
                    </h3>
                    <p className="text-xs text-brand-muted flex items-center gap-1.5">
                      <FaMapMarkerAlt className="w-3 h-3 text-brand-red" />
                      {theatre.location} &bull; M-Ticket Available
                    </p>
                  </div>

                  {/* Showtime Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {theatre.shows.map((show) => {
                      const showId = show._id || show.showId;
                      const timeString = show.showTime || show.showtime || "18:30";
                      const price = show.ticketPrice || 250;

                      return (
                        <button
                          key={showId}
                          onClick={() => navigate(`/seatspage/${showId}`)}
                          className="group flex flex-col items-center justify-center px-4 py-2.5 bg-brand-dark hover:bg-brand-red border border-brand-border hover:border-brand-red rounded-xl transition-all duration-200"
                        >
                          <span className="text-sm font-bold text-white group-hover:text-white">
                            {timeString}
                          </span>
                          <span className="text-[10px] font-medium text-emerald-400 group-hover:text-white/90">
                            From ₹{price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : availableDates.length > 0 ? (
              <div className="p-8 bg-brand-card/40 border border-brand-border rounded-xl text-center text-brand-muted text-sm">
                No shows scheduled for the selected date. Please click another date tab above.
              </div>
            ) : null}
          </div>
        </div>

        {/* 4. Community Reviews & Rating Section */}
        <div className="mt-14 pt-8 border-t border-brand-border">
          <div className="flex items-center gap-2 mb-6">
            <FaCommentDots className="w-5 h-5 text-brand-red" />
            <h2 className="text-2xl font-bold text-white">Community Reviews</h2>
          </div>

          {/* Submission Form */}
          <form
            onSubmit={handleReviewSubmit}
            className="bg-brand-card border border-brand-border rounded-2xl p-5 mb-8 space-y-4"
          >
            <h3 className="text-sm font-semibold text-white">Leave Your Rating & Review</h3>
            <div className="flex items-center gap-3">
              <label className="text-xs text-brand-muted">Rating:</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="bg-brand-dark border border-brand-border rounded-lg text-white text-xs px-3 py-1.5 outline-none focus:border-brand-red"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Masterpiece)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Great)</option>
                <option value={3}>⭐⭐⭐ (3 - Good)</option>
                <option value={2}>⭐⭐ (2 - Mediocre)</option>
                <option value={1}>⭐ (1 - Poor)</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think of the cinematography, acting, and plot?"
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white text-xs outline-none focus:border-brand-red placeholder-brand-muted"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {submittingReview ? "Posting..." : "Post Review"}
            </button>
          </form>

          {/* Review List */}
          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div
                  key={rev._id || rev.reviewId}
                  className="bg-brand-card border border-brand-border/60 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-white">
                      {rev.username || rev.email || "Audience Member"}
                    </span>
                    <div className="flex items-center text-amber-400 text-xs">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <FaStar key={i} className="w-3 h-3" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    {rev.review || rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-brand-muted text-center py-6">
                Be the first to review this movie!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MovieDetails;