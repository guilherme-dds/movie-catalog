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
} from "lucide-react";
import type { TMDBMovie, CommentItem } from "../types";
import { getImageUrl } from "../api/tmdb";
import { useAuth } from "../context/AuthContext";
import { getCommentsApi, addCommentApi, deleteCommentApi } from "../api/backend";

interface MovieDetailsModalProps {
  movie: TMDBMovie | null;
  onClose: () => void;
  isFavorite: boolean;
  isFavoriting?: boolean;
  onToggleFavorite: (movie: TMDBMovie) => void;
  showToast: (type: "success" | "error", text: string) => void;
  openAuthModal: () => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  isFavorite,
  isFavoriting = false,
  onToggleFavorite,
  showToast,
  openAuthModal,
}) => {
  const { user, token, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!movie || !token) return;
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

  useEffect(() => {
    if (movie && isAuthenticated) {
      fetchComments();
    } else {
      setComments([]);
    }
  }, [movie, isAuthenticated, fetchComments]);

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
      showToast("error", err.message || "Erro ao adicionar comentário.");
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
          {/* Left Column: Poster & Quick Action */}
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
                  comments.map((c) => (
                    <div key={c.id} className="comment-card">
                      <div className="comment-header">
                        <div className="comment-author">
                          <div className="author-avatar">
                            <UserIcon size={14} />
                          </div>
                          <span className="author-name">
                            {c.usuarioId === user?.id ? "Você" : `Usuário #${c.usuarioId}`}
                          </span>
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
