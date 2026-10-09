import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Heart,
  Star,
  Calendar,
  UserCheck,
  MessageSquare,
  Send,
  Trash2,
  Lock,
  User as UserIcon,
  Sparkles,
  Loader2,
  Plus,
  ListPlus,
  Crown,
} from "lucide-react";
import type { TMDBMovie, CommentItem, CustomList } from "../types";
import { getImageUrl } from "../api/tmdb";
import { useAuth } from "../context/AuthContext";
import {
  getCommentsApi,
  addCommentApi,
  deleteCommentApi,
  getCustomListsApi,
  addMovieToCustomListApi,
} from "../api/backend";
import { PremiumBadge } from "./PremiumBadge";

interface MovieDetailsModalProps {
  movie: TMDBMovie | null;
  onClose: () => void;
  isFavorite: boolean;
  isFavoriting?: boolean;
  onToggleFavorite: (movie: TMDBMovie) => void;
  showToast: (type: "success" | "error" | "info", text: string) => void;
  openAuthModal: () => void;
  openPremiumModal?: () => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  isFavorite,
  isFavoriting = false,
  onToggleFavorite,
  showToast,
  openAuthModal,
  openPremiumModal,
}) => {
  const { user, token, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [showAddToListDropdown, setShowAddToListDropdown] = useState(false);
  const [addingToListId, setAddingToListId] = useState<number | null>(null);

  const fetchComments = useCallback(async () => {
    if (!movie) return;
    setIsLoadingComments(true);
    try {
      const data = await getCommentsApi(token, movie.id);
      setComments(data);
    } catch (err: any) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [movie, token]);

  const fetchCustomLists = useCallback(async () => {
    if (!token || !user?.isPremium) return;
    try {
      const lists = await getCustomListsApi(token);
      setCustomLists(lists);
    } catch {
      // ignore silently if not premium
    }
  }, [token, user?.isPremium]);

  useEffect(() => {
    if (movie) {
      fetchComments();
      fetchCustomLists();
    } else {
      setComments([]);
      setShowAddToListDropdown(false);
    }
  }, [movie, fetchComments, fetchCustomLists]);

  if (!movie) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      openAuthModal();
      return;
    }

    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const created = await addCommentApi(token, movie.id, newCommentText.trim());
      setComments((prev) => [created, ...prev]);
      setNewCommentText("");
      showToast("success", "Comentário publicado com sucesso!");
    } catch (err: any) {
      if (err.message && err.message.includes("Plano Gratuito") && openPremiumModal) {
        showToast("error", err.message);
        openPremiumModal();
      } else {
        showToast("error", err.message || "Erro ao adicionar comentário.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
    try {
      await deleteCommentApi(token, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showToast("success", "Comentário removido.");
    } catch (err: any) {
      showToast("error", err.message || "Erro ao deletar comentário.");
    }
  };

  const handleAddMovieToCustomList = async (listId: number, listTitle: string) => {
    if (!token) return;
    setAddingToListId(listId);
    try {
      await addMovieToCustomListApi(token, listId, movie.id, movie.title, movie.poster_path);
      showToast("success", `Filme adicionado à lista "${listTitle}"!`);
      setShowAddToListDropdown(false);
    } catch (err: any) {
      showToast("error", err.message || "Erro ao adicionar filme à lista personalizada.");
    } finally {
      setAddingToListId(null);
    }
  };

  const handleCustomListBtnClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!user?.isPremium) {
      showToast("info", "Listas personalizadas são exclusivas para membros Premium!");
      if (openPremiumModal) openPremiumModal();
      return;
    }
    setShowAddToListDropdown(!showAddToListDropdown);
  };

  const releaseDateFormatted = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Data desconhecida";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card movie-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="details-layout">
          {/* Left Column: Poster & Quick Actions */}
          <div className="details-sidebar">
            <div className="details-poster-wrapper">
              <img
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="details-poster"
              />
              <div className="details-rating-chip">
                <Star size={16} className="star-icon" />
                <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
              </div>
            </div>

            <div className="sidebar-action-buttons">
              <button
                className={`details-fav-btn ${isFavorite ? "active" : ""} ${isFavoriting ? "loading" : ""}`}
                disabled={isFavoriting}
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal();
                  } else if (!isFavoriting) {
                    onToggleFavorite(movie);
                  }
                }}
              >
                {isFavoriting ? (
                  <>
                    <Loader2 size={20} className="spinning-icon" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Heart size={20} className={isFavorite ? "fill-heart" : ""} />
                    <span>{isFavorite ? "Favoritado" : "Adicionar aos Favoritos"}</span>
                  </>
                )}
              </button>

              {/* Add to Custom List (Premium Feature) */}
              <div className="custom-list-dropdown-container">
                <button
                  className={`btn-add-custom-list ${user?.isPremium ? "premium-unlocked" : "locked-feature"}`}
                  onClick={handleCustomListBtnClick}
                >
                  <ListPlus size={18} />
                  <span>Adicionar à Lista</span>
                  {!user?.isPremium && <Crown size={14} className="gold-crown-icon" />}
                </button>

                {showAddToListDropdown && user?.isPremium && (
                  <div className="custom-list-dropdown-menu">
                    <div className="dropdown-header">Escolha uma Lista:</div>
                    {customLists.length === 0 ? (
                      <div className="dropdown-empty">
                        <p>Nenhuma lista criada.</p>
                        <p className="sub">Crie uma lista no seu Perfil!</p>
                      </div>
                    ) : (
                      customLists.map((list) => (
                        <button
                          key={list.id}
                          className="dropdown-item"
                          disabled={addingToListId === list.id}
                          onClick={() => handleAddMovieToCustomList(list.id, list.nome)}
                        >
                          <Plus size={14} />
                          <span>{list.nome}</span>
                          {addingToListId === list.id && <Loader2 size={14} className="spinning-icon" />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Information & Comments */}
          <div className="details-main">
            <div className="details-header">
              <h2 className="details-title">{movie.title}</h2>
              {movie.original_title && movie.original_title !== movie.title && (
                <p className="details-original-title">Título Original: {movie.original_title}</p>
              )}

              <div className="details-tags">
                <span className="tag-chip">
                  <Calendar size={14} />
                  {releaseDateFormatted}
                </span>

                {movie.character && (
                  <span className="tag-chip character">
                    <UserCheck size={14} />
                    Papel: {movie.character}
                  </span>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="details-section">
              <h3>Sinopse</h3>
              <p className="overview-text">
                {movie.overview || "Nenhuma sinopse disponível para este filme no momento."}
              </p>
            </div>

            {/* Comments Section */}
            <div className="details-section comments-section">
              <div className="section-title-row">
                <div className="title-with-icon">
                  <MessageSquare size={18} />
                  <h3>Comentários dos Usuários</h3>
                </div>
                <span className="comments-count-badge">{comments.length}</span>
              </div>

              {!isAuthenticated ? (
                <div className="auth-required-box" onClick={openAuthModal}>
                  <Lock size={20} />
                  <div>
                    <p className="box-title">Faça login para comentar neste filme</p>
                    <p className="box-sub">Compartilhe sua opinião sobre este clássico do Tom Hanks.</p>
                  </div>
                  <button className="box-btn">Entrar</button>
                </div>
              ) : (
                <form onSubmit={handleAddComment} className="comment-form">
                  <textarea
                    placeholder="Escreva seu comentário sobre este filme..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    rows={3}
                    maxLength={500}
                    required
                  />
                  <div className="comment-form-footer">
                    <span className="char-count">{newCommentText.length}/500</span>
                    <button
                      type="submit"
                      className="submit-comment-btn"
                      disabled={isSubmittingComment || !newCommentText.trim()}
                    >
                      {isSubmittingComment ? (
                        <span className="btn-spinner"></span>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Comentar</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="comments-list">
                {isLoadingComments ? (
                  <div className="comments-loading">
                    <Sparkles className="spinning-icon" size={24} />
                    <span>Carregando comentários...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="no-comments-state">
                    <p>Nenhum comentário publicado ainda.</p>
                  </div>
                ) : (
                  comments.map((c) => {
                    const isCommentAuthorPremium = Boolean(c.usuario?.isPremium);
                    const authorName = c.usuario?.nome || (c.usuarioId === user?.id ? "Você" : `Usuário #${c.usuarioId.slice(0, 6)}`);

                    return (
                      <div key={c.id} className={`comment-card ${isCommentAuthorPremium ? "premium-author-card" : ""}`}>
                        <div className="comment-header">
                          <div className="comment-author">
                            <div className="avatar-circle small">
                              {c.usuario?.fotoPerfil ? (
                                <img src={c.usuario.fotoPerfil} alt="" className="comment-avatar-img" />
                              ) : (
                                <UserIcon size={14} />
                              )}
                            </div>
                            <span className="author-name">{authorName}</span>
                            {isCommentAuthorPremium && <PremiumBadge size="sm" />}
                          </div>
                          <div className="comment-meta">
                            {c.criadoEm && (
                              <span className="comment-date">
                                {new Date(c.criadoEm).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                            {c.usuarioId === user?.id && (
                              <button
                                className="delete-comment-btn"
                                onClick={() => handleDeleteComment(c.id)}
                                title="Deletar comentário"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="comment-body">{c.texto}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
