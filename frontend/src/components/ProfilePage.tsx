import React, { useState, useEffect } from "react";
import { User as UserIcon, Heart, Edit3, Check, X, ArrowLeft, Film } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { FavoriteItem, TMDBMovie } from "../types";
import { MovieCard } from "./MovieCard";

interface ProfilePageProps {
  favorites: FavoriteItem[];
  movies: TMDBMovie[];
  favoritingMovieIds: Set<number>;
  onToggleFavorite: (movie: TMDBMovie) => Promise<void>;
  onSelectMovie: (movie: TMDBMovie) => void;
  onBackToCatalog: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  favorites,
  movies,
  favoritingMovieIds,
  onToggleFavorite,
  onSelectMovie,
  onBackToCatalog,
}) => {
  const { user } = useAuth();

  const bioKey = user ? `user_bio_${user.id}` : "user_bio_default";

  const [bio, setBio] = useState<string>(() => {
    return localStorage.getItem(bioKey) || "Apaixonado por cinema e grande fã dos filmes de Tom Hanks.";
  });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);

  useEffect(() => {
    if (user) {
      const savedBio = localStorage.getItem(`user_bio_${user.id}`);
      if (savedBio !== null) {
        setBio(savedBio);
        setTempBio(savedBio);
      }
    }
  }, [user]);

  const handleSaveBio = () => {
    const trimmed = tempBio.trim();
    setBio(trimmed);
    if (user) {
      localStorage.setItem(`user_bio_${user.id}`, trimmed);
    }
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  // Map user favorites to full TMDBMovie objects (or fallback objects if tmdb data is loading/missing)
  const favoriteMoviesList: TMDBMovie[] = favorites.map((fav) => {
    const fullMovie = movies.find((m) => m.id === fav.tmdbMovieId);
    if (fullMovie) return fullMovie;

    return {
      id: fav.tmdbMovieId,
      title: fav.titulo,
      overview: "",
      poster_path: fav.posterPath,
      release_date: "",
      vote_average: 0,
    };
  });

  const userName = user?.nome || (user?.email ? user.email.split("@")[0] : "Usuário");

  return (
    <div className="profile-page-container">
      {/* Return Navigation */}
      <button className="back-catalog-btn" onClick={onBackToCatalog}>
        <ArrowLeft size={18} />
        <span>Voltar ao Catálogo</span>
      </button>

      {/* Profile Card Header: Nome & Bio Curta */}
      <div className="profile-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-circle">
            <UserIcon size={44} />
          </div>
        </div>

        <div className="profile-info-section">
          {/* User Name */}
          <h1 className="profile-name">{userName}</h1>
          <span className="profile-email-sub">{user?.email}</span>

          {/* Short Bio */}
          <div className="profile-bio-container">
            {isEditingBio ? (
              <div className="bio-edit-wrapper">
                <textarea
                  className="bio-textarea"
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  placeholder="Escreva uma bio curta..."
                  maxLength={160}
                  rows={2}
                />
                <div className="bio-edit-actions">
                  <span className="bio-char-count">{tempBio.length}/160</span>
                  <div className="bio-btn-group">
                    <button className="bio-btn cancel" onClick={handleCancelBio} title="Cancelar">
                      <X size={14} /> Cancelar
                    </button>
                    <button className="bio-btn save" onClick={handleSaveBio} title="Salvar">
                      <Check size={14} /> Salvar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bio-display-wrapper">
                <p className="profile-bio-text">
                  {bio ? bio : <span className="bio-placeholder">Nenhuma bio informada.</span>}
                </p>
                <button
                  className="bio-edit-trigger"
                  onClick={() => {
                    setTempBio(bio);
                    setIsEditingBio(true);
                  }}
                  title="Editar bio curta"
                >
                  <Edit3 size={14} />
                  <span>Editar bio</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Favorite Movies List */}
      <div className="profile-favorites-section">
        <div className="section-header-row">
          <h2 className="section-title">
            <Heart size={24} style={{ color: "#e50914", fill: "#e50914" }} />
            <span>Filmes Favoritos</span>
          </h2>
          <span className="results-count">
            <strong>{favorites.length}</strong> {favorites.length === 1 ? "filme" : "filmes"}
          </span>
        </div>

        {favoriteMoviesList.length === 0 ? (
          <div className="catalog-empty">
            <div className="empty-icon-wrapper">
              <Film size={32} />
            </div>
            <h3>Nenhum filme favorito</h3>
            <p>Você ainda não adicionou nenhum filme aos seus favoritos.</p>
          </div>
        ) : (
          <div className="movie-grid">
            {favoriteMoviesList.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={true}
                isFavoriting={favoritingMovieIds.has(movie.id)}
                favoriteItem={favorites.find((f) => f.tmdbMovieId === movie.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectMovie={onSelectMovie}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
