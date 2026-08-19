import React from "react";
import { Star, Heart, MessageSquare, Calendar, UserCheck, Loader2 } from "lucide-react";
import type { TMDBMovie, FavoriteItem } from "../types";
import { getImageUrl } from "../api/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
  isFavorite: boolean;
  isFavoriting?: boolean;
  favoriteItem?: FavoriteItem;
  onToggleFavorite: (movie: TMDBMovie) => void;
  onSelectMovie: (movie: TMDBMovie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isFavorite,
  isFavoriting = false,
  onToggleFavorite,
  onSelectMovie,
}) => {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  const formattedRating = movie.vote_average
    ? movie.vote_average.toFixed(1)
    : "N/A";

  return (
    <div className="movie-card" onClick={() => onSelectMovie(movie)}>
      <div className="poster-container">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
        />

        <div className="poster-overlay">
          <div className="overlay-content">
            <p className="overview-snippet">
              {movie.overview
                ? movie.overview.length > 140
                  ? `${movie.overview.substring(0, 140)}...`
                  : movie.overview
                : "Sem sinopse disponível."}
            </p>
            <button className="details-btn">
              <MessageSquare size={16} />
              <span>Ver Comentários & Detalhes</span>
            </button>
          </div>
        </div>

        {/* Favorite Quick Action Toggle */}
        <button
          className={`favorite-toggle-btn ${isFavorite ? "is-favorite" : ""} ${isFavoriting ? "is-loading" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isFavoriting) {
              onToggleFavorite(movie);
            }
          }}
          disabled={isFavoriting}
          title={
            isFavoriting
              ? "Processando favorito..."
              : isFavorite
              ? "Remover dos Favoritos"
              : "Adicionar aos Favoritos"
          }
        >
          {isFavoriting ? (
            <Loader2 size={18} className="spinning-icon" />
          ) : (
            <Heart size={20} className={isFavorite ? "filled-heart" : ""} />
          )}
        </button>

        {/* Rating Badge */}
        <div className="rating-badge">
          <Star size={14} className="star-icon" />
          <span>{formattedRating}</span>
        </div>
      </div>

      <div className="card-info">
        <div className="card-header-meta">
          <span className="year-badge">
            <Calendar size={13} />
            {releaseYear}
          </span>
          {movie.character && (
            <span className="character-badge" title={`Papel: ${movie.character}`}>
              <UserCheck size={12} />
              {movie.character.length > 18
                ? `${movie.character.substring(0, 18)}...`
                : movie.character}
            </span>
          )}
        </div>

        <h3 className="movie-title" title={movie.title}>
          {movie.title}
        </h3>
      </div>
    </div>
  );
};
