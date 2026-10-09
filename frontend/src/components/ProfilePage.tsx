import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User as UserIcon,
  Heart,
  Edit3,
  Check,
  X,
  ArrowLeft,
  Film,
  Loader2,
  Camera,
  Trash2,
  Crown,
  Plus,
  ListFilter,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { FavoriteItem, TMDBMovie, CustomList } from "../types";
import { MovieCard } from "./MovieCard";
import { PremiumBadge } from "./PremiumBadge";
import {
  getUserProfileApi,
  updateUserProfileApi,
  uploadUserAvatarApi,
  removeUserAvatarApi,
  getCustomListsApi,
  createCustomListApi,
  deleteCustomListApi,
  removeMovieFromCustomListApi,
} from "../api/backend";

interface ProfilePageProps {
  favorites: FavoriteItem[];
  movies: TMDBMovie[];
  favoritingMovieIds: Set<number>;
  onToggleFavorite: (movie: TMDBMovie) => Promise<void>;
  onSelectMovie: (movie: TMDBMovie) => void;
  onBackToCatalog: () => void;
  showToast?: (type: "success" | "error" | "info", text: string) => void;
  openPremiumModal?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  favorites,
  movies,
  favoritingMovieIds,
  onToggleFavorite,
  onSelectMovie,
  onBackToCatalog,
  showToast,
  openPremiumModal,
}) => {
  const { user, token, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState<string>(user?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  // Active Profile Tab: "favorites" | "custom_lists"
  const [activeTab, setActiveTab] = useState<"favorites" | "custom_lists">("favorites");

  // Custom Lists State
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

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
            updateUser({
              bio: bioText,
              fotoPerfil: fetchedUser.fotoPerfil,
              isPremium: fetchedUser.isPremium,
            });
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

  // Load Custom Lists if Premium
  const loadCustomLists = useCallback(async () => {
    if (!token || !user?.isPremium) return;
    setIsLoadingLists(true);
    try {
      const lists = await getCustomListsApi(token);
      setCustomLists(lists);
    } catch (err: any) {
      console.error("Erro ao carregar listas personalizadas:", err);
    } finally {
      setIsLoadingLists(false);
    }
  }, [token, user?.isPremium]);

  useEffect(() => {
    if (activeTab === "custom_lists" && user?.isPremium) {
      loadCustomLists();
    }
  }, [activeTab, user?.isPremium, loadCustomLists]);

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

  const handleAvatarClick = () => {
    if (fileInputRef.current && !isUploadingAvatar && !isRemovingAvatar) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const isImage =
      allowedMimeTypes.includes(file.type.toLowerCase()) || file.type.startsWith("image/");
    if (!isImage) {
      showToast?.(
        "error",
        "Formato de arquivo inválido! Por favor envie um arquivo de imagem (JPG, PNG, WEBP, GIF)."
      );
      return;
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      showToast?.(
        "error",
        `A imagem selecionada é muito grande (${sizeInMb}MB)! O tamanho máximo permitido é 5MB.`
      );
      return;
    }

    if (!token) {
      showToast?.("error", "Você precisa estar autenticado para enviar uma foto de perfil.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await uploadUserAvatarApi(file, token);
      updateUser({ fotoPerfil: updatedUser.fotoPerfil });
      showToast?.("success", "Foto de perfil salva com sucesso!");
    } catch (err: any) {
      console.error("Erro no upload da foto de perfil:", err);
      showToast?.("error", err.message || "Erro ao fazer upload da foto de perfil.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!token) return;
    setIsRemovingAvatar(true);
    try {
      await removeUserAvatarApi(token);
      updateUser({ fotoPerfil: null });
      showToast?.("success", "Foto de perfil removida com sucesso!");
    } catch (err: any) {
      console.error("Erro ao remover foto de perfil:", err);
      showToast?.("error", err.message || "Erro ao remover foto de perfil.");
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  // Custom List Handlers
  const handleCreateCustomList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newListName.trim()) return;
    setIsCreatingList(true);
    try {
      const newList = await createCustomListApi(token, newListName.trim(), newListDesc.trim());
      setCustomLists((prev) => [newList, ...prev]);
      setNewListName("");
      setNewListDesc("");
      setShowCreateModal(false);
      showToast?.("success", `Lista "${newList.nome}" criada com sucesso!`);
    } catch (err: any) {
      showToast?.("error", err.message || "Erro ao criar lista personalizada.");
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDeleteCustomList = async (listId: number, listName: string) => {
    if (!token) return;
    try {
      await deleteCustomListApi(token, listId);
      setCustomLists((prev) => prev.filter((l) => l.id !== listId));
      showToast?.("success", `Lista "${listName}" excluída com sucesso.`);
    } catch (err: any) {
      showToast?.("error", err.message || "Erro ao excluir lista.");
    }
  };

  const handleRemoveItemFromList = async (listId: number, tmdbMovieId: number) => {
    if (!token) return;
    try {
      await removeMovieFromCustomListApi(token, listId, tmdbMovieId);
      setCustomLists((prev) =>
        prev.map((l) => {
          if (l.id === listId) {
            return {
              ...l,
              itens: l.itens?.filter((item) => item.tmdbMovieId !== tmdbMovieId),
            };
          }
          return l;
        })
      );
      showToast?.("success", "Filme removido da lista.");
    } catch (err: any) {
      showToast?.("error", err.message || "Erro ao remover filme da lista.");
    }
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
  const isPremium = Boolean(user?.isPremium);

  return (
    <div className="profile-page-container">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
      />

      {/* Return Navigation */}
      <button className="back-catalog-btn" onClick={onBackToCatalog}>
        <ArrowLeft size={18} />
        <span>Voltar ao Catálogo</span>
      </button>

      {/* Profile Header */}
      <div className="profile-card">
        <div className="profile-avatar-wrapper">
          <div
            className={`profile-avatar-circle ${isUploadingAvatar ? "uploading" : ""}`}
            onClick={handleAvatarClick}
            title="Clique para alterar a foto de perfil"
          >
            {isUploadingAvatar ? (
              <Loader2 size={36} className="spinning-icon avatar-spinner" />
            ) : user?.fotoPerfil ? (
              <img src={user.fotoPerfil} alt={userName} className="profile-avatar-img" />
            ) : (
              <UserIcon size={44} />
            )}

            <div className="avatar-hover-overlay">
              <Camera size={22} />
              <span>Alterar</span>
            </div>
          </div>

          <div className="avatar-action-buttons">
            <button
              className="avatar-action-btn upload-btn"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar || isRemovingAvatar}
            >
              <Camera size={14} />
              <span>{user?.fotoPerfil ? "Trocar Foto" : "Enviar Foto"}</span>
            </button>

            {user?.fotoPerfil && (
              <button
                className="avatar-action-btn remove-btn"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar || isRemovingAvatar}
              >
                {isRemovingAvatar ? (
                  <Loader2 size={14} className="spinning-icon" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>Remover</span>
              </button>
            )}
          </div>
          <span className="avatar-hint-text">Formatos: JPG, PNG, WEBP, GIF (máx. 5MB)</span>
        </div>

        <div className="profile-info-section">
          {/* User Name & Premium Badge */}
          <div className="profile-title-row">
            <h1 className="profile-name">{userName}</h1>
            {isPremium ? (
              <PremiumBadge size="md" />
            ) : (
              <span className="plan-chip free-chip">Plano Gratuito (Limitado a 5 ítens)</span>
            )}
          </div>
          <span className="profile-email-sub">{user?.email}</span>

          {/* Premium Plan Status Banner */}
          <div className="profile-plan-status-card">
            {isPremium ? (
              <div className="plan-status-content premium">
                <div>
                  <h4><Crown size={16} className="gold-text" /> Você é um Membro Premium</h4>
                  <p>Comentários e favoritos ilimitados + Listas personalizadas desbloqueadas!</p>
                </div>
                {openPremiumModal && (
                  <button className="btn btn-sm btn-manage-plan" onClick={openPremiumModal}>
                    Gerenciar Assinatura
                  </button>
                )}
              </div>
            ) : (
              <div className="plan-status-content free">
                <div>
                  <h4>Plano Gratuito Ativo</h4>
                  <p>Limite de 5 favoritos/comentários e sem listas personalizadas.</p>
                </div>
                {openPremiumModal && (
                  <button className="btn btn-sm btn-upgrade-gold" onClick={openPremiumModal}>
                    <Sparkles size={14} /> Assinar Premium (R$ 19,90/mês)
                  </button>
                )}
              </div>
            )}
          </div>

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
                      disabled={isSavingBio}
                    >
                      <X size={14} /> Cancelar
                    </button>
                    <button
                      className="bio-btn save"
                      onClick={handleSaveBio}
                      disabled={isSavingBio}
                    >
                      {isSavingBio ? (
                        <Loader2 size={14} className="spinning-icon" />
                      ) : (
                        <Check size={14} />
                      )}{" "}
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bio-display-wrapper">
                <p className="profile-bio-text">
                  {bio ? (
                    bio
                  ) : (
                    <span className="bio-placeholder">
                      Nenhuma bio cadastrada. Clique ao lado para adicionar.
                    </span>
                  )}
                </p>
                <button
                  className="bio-edit-trigger"
                  onClick={() => {
                    setTempBio(bio);
                    setIsEditingBio(true);
                  }}
                >
                  <Edit3 size={14} />
                  <span>Editar bio</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs-header">
        <button
          className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          <Heart size={18} />
          <span>Filmes Favoritos</span>
          <span className="tab-count">{favorites.length}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "custom_lists" ? "active" : ""}`}
          onClick={() => setActiveTab("custom_lists")}
        >
          <ListFilter size={18} />
          <span>Listas Personalizadas</span>
          {isPremium ? (
            <span className="tab-count">{customLists.length}</span>
          ) : (
            <Crown size={14} className="gold-text margin-left" />
          )}
        </button>
      </div>

      {/* Tab Content 1: Favorites */}
      {activeTab === "favorites" && (
        <div className="profile-favorites-section">
          <div className="section-header-row">
            <h2 className="section-title">
              <Heart size={24} style={{ color: "#e50914", fill: "#e50914" }} />
              <span>Meus Favoritos</span>
            </h2>
            <span className="results-count">
              <strong>{favorites.length}</strong> {favorites.length === 1 ? "filme" : "filmes"}
              {!isPremium && <span className="free-limit-hint"> (Máx: 5 no Plano Gratuito)</span>}
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
      )}

      {/* Tab Content 2: Custom Lists (Premium Feature) */}
      {activeTab === "custom_lists" && (
        <div className="profile-custom-lists-section">
          {!isPremium ? (
            <div className="premium-lock-banner">
              <div className="lock-icon-wrapper">
                <Crown size={40} className="gold-text" />
              </div>
              <h3>Listas Personalizadas de Filmes (Nomes Customizados)</h3>
              <p>
                Crie e organize suas próprias listas de filmes com nomes e descrições do seu jeito!
                Este recurso é exclusivo para membros do <strong>Plano Premium</strong>.
              </p>

              <div className="lock-features-list">
                <div className="lock-item"><Check size={16} className="gold-text" /> Crie quantas listas desejar com nomes customizados</div>
                <div className="lock-item"><Check size={16} className="gold-text" /> Adicione qualquer filme do catálogo Tom Hanks às suas listas</div>
                <div className="lock-item"><Check size={16} className="gold-text" /> Ganhe o Selo Premium VIP no seu perfil e comentários</div>
                <div className="lock-item"><Check size={16} className="gold-text" /> Comentários e favoritos 100% ilimitados</div>
              </div>

              {openPremiumModal && (
                <button className="btn btn-upgrade-gold lg" onClick={openPremiumModal}>
                  <Sparkles size={18} />
                  <span>Desbloquear Plano Premium por R$ 19,90/mês</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="section-header-row">
                <h2 className="section-title">
                  <ListFilter size={24} style={{ color: "#f5c518" }} />
                  <span>Minhas Listas Personalizadas</span>
                </h2>

                <button
                  className="btn btn-primary btn-create-list"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={18} />
                  <span>Criar Nova Lista</span>
                </button>
              </div>

              {isLoadingLists ? (
                <div className="catalog-loading">
                  <Loader2 className="spinning-icon" size={28} />
                  <span>Carregando suas listas personalizadas...</span>
                </div>
              ) : customLists.length === 0 ? (
                <div className="catalog-empty">
                  <div className="empty-icon-wrapper gold-bg">
                    <ListFilter size={32} className="gold-text" />
                  </div>
                  <h3>Nenhuma lista personalizada criada ainda</h3>
                  <p>Crie sua primeira lista com um nome e descrição do seu jeito!</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                    style={{ marginTop: "1rem" }}
                  >
                    <Plus size={16} /> Criar Minha Primeira Lista
                  </button>
                </div>
              ) : (
                <div className="custom-lists-grid">
                  {customLists.map((list) => (
                    <div key={list.id} className="custom-list-card">
                      <div className="custom-list-header">
                        <div>
                          <h3 className="custom-list-title">{list.nome}</h3>
                          {list.descricao && <p className="custom-list-desc">{list.descricao}</p>}
                        </div>
                        <button
                          className="delete-list-btn"
                          onClick={() => handleDeleteCustomList(list.id, list.nome)}
                          title="Excluir Lista"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="custom-list-movies-container">
                        {!list.itens || list.itens.length === 0 ? (
                          <div className="empty-list-dropzone">
                            <p>Nenhum filme adicionado a esta lista ainda.</p>
                            <p className="sub">Abra qualquer filme no catálogo para adicioná-lo aqui!</p>
                          </div>
                        ) : (
                          <div className="custom-list-movies-grid">
                            {list.itens.map((item) => (
                              <div key={item.id} className="custom-movie-item-card">
                                <div className="item-poster-wrapper">
                                  {item.posterPath ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
                                      alt={item.titulo}
                                    />
                                  ) : (
                                    <div className="no-poster-placeholder">
                                      <Film size={20} />
                                    </div>
                                  )}
                                  <button
                                    className="remove-item-btn"
                                    onClick={() => handleRemoveItemFromList(list.id, item.tmdbMovieId)}
                                    title="Remover da lista"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <span className="item-title" title={item.titulo}>{item.titulo}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal Criar Nova Lista Personalizada */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card create-list-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
              <X size={20} />
            </button>

            <div className="modal-header">
              <Crown size={28} className="gold-text" />
              <h2>Criar Lista Personalizada</h2>
              <p>Defina um nome e descrição para sua coleção de filmes.</p>
            </div>

            <form onSubmit={handleCreateCustomList} className="create-list-form">
              <div className="form-group">
                <label>Nome da Lista *</label>
                <input
                  type="text"
                  placeholder="Ex: Melhores Anos 90, Filmes Marcantes..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  maxLength={80}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição (Opcional)</label>
                <textarea
                  placeholder="Descreva o objetivo desta lista..."
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreatingList}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreatingList || !newListName.trim()}
                >
                  {isCreatingList ? <Loader2 size={16} className="spinning-icon" /> : "Criar Lista"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
