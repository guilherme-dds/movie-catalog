import React, { useState, useEffect, useCallback } from "react";
import { X, Trash2, Search, ShieldAlert, Sparkles, MessageSquare, User as UserIcon, Calendar, Film } from "lucide-react";
import type { CommentItem, TMDBMovie } from "../types";
import { getAllCommentsAdminApi, deleteCommentApi } from "../api/backend";
import { useAuth } from "../context/AuthContext";

interface AdminCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moviesList?: TMDBMovie[];
  showToast: (type: "success" | "error" | "info", text: string) => void;
}

export const AdminCommentsModal: React.FC<AdminCommentsModalProps> = ({
  isOpen,
  onClose,
  moviesList = [],
  showToast,
}) => {
  const { token } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAllComments = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getAllCommentsAdminApi(token);
      setComments(data);
    } catch (err: any) {
      showToast("error", err.message || "Erro ao carregar comentários para moderação.");
    } finally {
      setIsLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    if (isOpen) {
      fetchAllComments();
    }
  }, [isOpen, fetchAllComments]);

  if (!isOpen) return null;

  const handleDelete = async (commentId: number) => {
    if (!token) return;

    if (!window.confirm("Tem certeza que deseja deletar este comentário? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeletingId(commentId);
    try {
      await deleteCommentApi(token, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showToast("success", "Comentário deletado com sucesso pelo administrador.");
    } catch (err: any) {
      showToast("error", err.message || "Erro ao deletar comentário.");
    } finally {
      setDeletingId(null);
    }
  };

  // Map movie titles helper
  const getMovieTitle = (tmdbMovieId: number) => {
    const movie = moviesList.find((m) => m.id === tmdbMovieId);
    return movie ? movie.title : `Filme #${tmdbMovieId}`;
  };

  const filteredComments = comments.filter((c) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const authorName = c.usuario?.nome?.toLowerCase() || "";
    const authorEmail = c.usuario?.email?.toLowerCase() || "";
    const commentText = c.texto.toLowerCase();
    const movieTitle = getMovieTitle(c.tmdbMovieId).toLowerCase();
    const movieIdStr = String(c.tmdbMovieId);

    return (
      authorName.includes(query) ||
      authorEmail.includes(query) ||
      commentText.includes(query) ||
      movieTitle.includes(query) ||
      movieIdStr.includes(query)
    );
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card admin-comments-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Fechar">
          <X size={22} />
        </button>

        <div className="admin-modal-header">
          <div className="admin-title-row">
            <div className="admin-icon-wrapper">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2>Moderação de Comentários</h2>
              <p className="admin-modal-sub">Painel do Administrador - Gestão Global de Comentários</p>
            </div>
          </div>

          <div className="admin-stats-row">
            <div className="admin-stat-chip">
              <MessageSquare size={16} />
              <span>Total: <strong>{comments.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="admin-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por usuário, email, conteúdo ou filme..."
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

        {/* Content list */}
        <div className="admin-comments-content">
          {isLoading ? (
            <div className="comments-loading">
              <Sparkles className="spinning-icon" size={28} />
              <span>Carregando todos os comentários do sistema...</span>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="no-comments-state">
              <MessageSquare size={32} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
              <p>{searchTerm ? `Nenhum comentário encontrado para "${searchTerm}".` : "Nenhum comentário cadastrado no sistema."}</p>
            </div>
          ) : (
            <div className="admin-comments-grid">
              {filteredComments.map((comment) => {
                const movieTitle = getMovieTitle(comment.tmdbMovieId);
                const isDeleting = deletingId === comment.id;

                return (
                  <div key={comment.id} className="admin-comment-card">
                    <div className="admin-card-top">
                      <div className="admin-card-user">
                        <div className="admin-avatar">
                          <UserIcon size={14} />
                        </div>
                        <div className="user-details">
                          <span className="user-name">
                            {comment.usuario?.nome || comment.usuario?.email || `Usuário #${comment.usuarioId}`}
                          </span>
                          {comment.usuario?.email && (
                            <span className="user-email">{comment.usuario.email}</span>
                          )}
                        </div>
                      </div>

                      <div className="admin-card-meta">
                        <span className="movie-tag">
                          <Film size={13} />
                          {movieTitle}
                        </span>
                        {comment.criadoEm && (
                          <span className="date-tag">
                            <Calendar size={13} />
                            {new Date(comment.criadoEm).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="admin-comment-text">{comment.texto}</p>

                    <div className="admin-card-footer">
                      <span className="comment-id-badge">ID #{comment.id}</span>
                      <button
                        className="admin-delete-btn"
                        disabled={isDeleting}
                        onClick={() => handleDelete(comment.id)}
                        title="Deletar comentário permanentemente"
                      >
                        {isDeleting ? (
                          <span className="btn-spinner"></span>
                        ) : (
                          <>
                            <Trash2 size={15} />
                            <span>Excluir</span>
                          </>
                        )}
                      </button>
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
