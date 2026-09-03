import React from "react";
import { Film, Heart, Search, LogOut, User as UserIcon, Sparkles, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
  favoritesCount: number;
  openAuthModal: () => void;
  openAdminModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  setSearchTerm,
  showOnlyFavorites,
  setShowOnlyFavorites,
  favoritesCount,
  openAuthModal,
  openAdminModal,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => setShowOnlyFavorites(false)}>
          <div className="logo-icon-wrapper">
            <Film className="logo-icon" size={26} />
            <Sparkles className="logo-sparkle" size={14} />
          </div>
          <div className="brand-text">
            <span className="brand-title">CineHanks</span>
            <span className="brand-subtitle">Catálogo Tom Hanks</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar por título, personagem ou ano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="navbar-actions">
          {/* Favorites Filter Toggle */}
          <button
            className={`nav-btn ${showOnlyFavorites ? "active" : ""}`}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            title="Filtrar Favoritos"
          >
            <Heart size={18} className={showOnlyFavorites ? "fill-heart" : ""} />
            <span className="btn-label">Favoritos</span>
            {favoritesCount > 0 && <span className="favorites-badge">{favoritesCount}</span>}
          </button>

          {/* Admin Moderation Button */}
          {isAuthenticated && isAdmin && openAdminModal && (
            <button
              className="nav-btn admin-nav-btn"
              onClick={openAdminModal}
              title="Painel de Moderação de Comentários (ADMIN)"
            >
              <ShieldAlert size={18} />
              <span className="btn-label">Moderação</span>
              <span className="admin-pill">ADMIN</span>
            </button>
          )}

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-badge" title={user?.email}>
                <div className="avatar-circle">
                  <UserIcon size={16} />
                </div>
                <span className="user-email">{user?.nome || user?.email.split("@")[0]}</span>
              </div>
              <button className="logout-btn" onClick={logout} title="Sair da Conta">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="login-trigger-btn" onClick={openAuthModal}>
              <UserIcon size={18} />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

