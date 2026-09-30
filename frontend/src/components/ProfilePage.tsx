import React, { useState, useEffect } from "react";
import { User as UserIcon, Heart, Edit3, Check, X, ArrowLeft, Film, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { FavoriteItem, TMDBMovie } from "../types";
import { MovieCard } from "./MovieCard";
import { getUserProfileApi, updateUserProfileApi } from "../api/backend";

interface ProfilePageProps {
  favorites: FavoriteItem[];
  movies: TMDBMovie[];
  favoritingMovieIds: Set<number>;
  onToggleFavorite: (movie: TMDBMovie) => Promise<void>;
  onSelectMovie: (movie: TMDBMovie) => void;
  onBackToCatalog: () => void;
  showToast?: (type: "success" | "error" | "info", text: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  favorites,
  movies,
  favoritingMovieIds,
  onToggleFavorite,
  onSelectMovie,
  onBackToCatalog,
  showToast,
}) => {
  const { user, token, updateUser } = useAuth();

  const [bio, setBio] = useState<string>(user?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Sync profile data from database on mount
  useEffect(() => {
    let isMounted = true;
    if (token) {
      getUserProfileApi(token)
        .then((fetchedUser) => {
          if (isMounted && fetchedUser) {
            const bioText = fetchedUser.bio || "";
            setBio(bioText);
            setTempBio(bioText);
            updateUser({ bio: bioText });
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar perfil:", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token, updateUser]);

  const handleSaveBio = async () => {
    if (!token) return;
    const trimmed = tempBio.trim();
    setIsSavingBio(true);
    try {
      const updatedUser = await updateUserProfileApi(token, trimmed);
      const newBio = updatedUser.bio || trimmed;
      setBio(newBio);
      setTempBio(newBio);
      updateUser({ bio: newBio });
      setIsEditingBio(false);
      showToast?.("success", "Bio atualizada com sucesso no banco de dados!");
    } catch (err: any) {
      console.error("Erro ao salvar bio:", err);
      showToast?.("error", err.message || "Erro ao salvar bio no banco de dados.");
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

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
                  maxLength={250}
                  rows={2}
                  disabled={isSavingBio}
                />
                <div className="bio-edit-actions">
                  <span className="bio-char-count">{tempBio.length}/250</span>
                  <div className="bio-btn-group">
                    <button
                      className="bio-btn cancel"
                      onClick={handleCancelBio}
                      title="Cancelar"
                      disabled={isSavingBio}
                    >
                      <X size={14} /> Cancelar
                    </button>
                    <button
                      className="bio-btn save"
                      onClick={handleSaveBio}
                      title="Salvar no banco de dados"
                      disabled={isSavingBio}
                    >
                      {isSavingBio ? <Loader2 size={14} className="spinning-icon" /> : <Check size={14} />} Salvar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bio-display-wrapper">
                <p className="profile-bio-text">
                  {bio ? bio : <span className="bio-placeholder">Nenhuma bio cadastrada. Clique ao lado para adicionar.</span>}
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
