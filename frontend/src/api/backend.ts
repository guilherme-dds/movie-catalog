import type { User, AuthResponse, RefreshTokenResponse, FavoriteItem, CommentItem } from "../types";

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string;
  if (envUrl && envUrl.trim().length > 0 && !envUrl.includes("VITE_API_BASE_URL")) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "/api";
}

const API_BASE_URL = getApiBaseUrl();

async function parseResponse<T>(response: Response, defaultErrorMessage: string): Promise<T> {
  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Resposta inválida do servidor (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || defaultErrorMessage);
  }

  return data as T;
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<AuthResponse>(response, "Falha na autenticação");
}

export async function refreshTokenApi(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  return parseResponse<RefreshTokenResponse>(response, "Falha ao renovar sessão");
}

export async function logoutApi(token?: string | null, refreshToken?: string | null, userId?: string | null): Promise<void> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers,
      body: JSON.stringify({ refreshToken, userId }),
    });
  } catch {
    // Silent catch on logout network error
  }
}

export async function requestPasswordResetApi(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return parseResponse<{ message: string }>(response, "Erro ao solicitar redefinição de senha");
}

export async function confirmPasswordResetApi(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  return parseResponse<{ message: string }>(response, "Erro ao redefinir senha");
}

export async function registerApi(nome: string, email: string, password: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, password }),
  });

  return parseResponse<{ user: User }>(response, "Erro ao cadastrar usuário");
}

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  defaultErrorMessage = "Erro na requisição com o servidor"
): Promise<T> {
  const activeToken = token || localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse<T>(response, defaultErrorMessage);
}

export async function getFavoritesApi(token?: string | null): Promise<FavoriteItem[]> {
  const data = await fetchWithAuth<{ favoriteList?: FavoriteItem[] }>("/favorite", {}, token, "Erro ao carregar favoritos");
  return data.favoriteList || [];
}

export async function addFavoriteApi(
  token: string | null,
  tmdbMovieId: number,
  titulo: string,
  posterPath: string | null
): Promise<FavoriteItem> {
  const data = await fetchWithAuth<{ newFavorite: FavoriteItem }>(
    "/favorite",
    {
      method: "POST",
      body: JSON.stringify({ tmdbMovieId: Number(tmdbMovieId), titulo, posterPath: posterPath || "" }),
    },
    token,
    "Erro ao adicionar aos favoritos"
  );
  return data.newFavorite;
}

export async function deleteFavoriteApi(token: string | null, favoriteId: number): Promise<void> {
  await fetchWithAuth<void>(
    `/favorite/${favoriteId}`,
    { method: "DELETE" },
    token,
    "Erro ao remover favorito"
  );
}

export async function getCommentsApi(token: string | null, movieId: number): Promise<CommentItem[]> {
  const data = await fetchWithAuth<{ comments?: CommentItem[] }>(
    `/comment/${movieId}`,
    {},
    token,
    "Erro ao buscar comentários"
  );
  return data.comments || [];
}

export async function addCommentApi(
  token: string | null,
  tmdbMovieId: number,
  texto: string
): Promise<CommentItem> {
  const data = await fetchWithAuth<{ newComment: CommentItem }>(
    "/comment",
    {
      method: "POST",
      body: JSON.stringify({ tmdbMovieId: Number(tmdbMovieId), texto }),
    },
    token,
    "Erro ao adicionar comentário"
  );
  return data.newComment;
}

export async function deleteCommentApi(token: string | null, commentId: number): Promise<void> {
  await fetchWithAuth<void>(
    `/comment/delete/${commentId}`,
    { method: "DELETE" },
    token,
    "Erro ao deletar comentário"
  );
}

export async function getAllCommentsAdminApi(token: string | null): Promise<CommentItem[]> {
  const data = await fetchWithAuth<{ comments?: CommentItem[] }>(
    "/comment/admin/all",
    {},
    token,
    "Erro ao buscar comentários para moderação"
  );
  return data.comments || [];
}

