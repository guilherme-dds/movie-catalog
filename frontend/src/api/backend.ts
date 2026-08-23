import type { User, AuthResponse, FavoriteItem, CommentItem } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "/api";

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

export async function registerApi(nome: string, email: string, password: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, password }),
  });

  return parseResponse<{ user: User }>(response, "Erro ao cadastrar usuário");
}

export async function getFavoritesApi(token: string): Promise<FavoriteItem[]> {
  const response = await fetch(`${API_BASE_URL}/favorite`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse<{ favoriteList?: FavoriteItem[] }>(response, "Erro ao carregar favoritos");
  return data.favoriteList || [];
}

export async function addFavoriteApi(
  token: string,
  tmdbMovieId: number,
  titulo: string,
  posterPath: string | null
): Promise<FavoriteItem> {
  const response = await fetch(`${API_BASE_URL}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tmdbMovieId, titulo, posterPath: posterPath || "" }),
  });

  const data = await parseResponse<{ newFavorite: FavoriteItem }>(response, "Erro ao adicionar aos favoritos");
  return data.newFavorite;
}

export async function deleteFavoriteApi(token: string, favoriteId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/favorite/${favoriteId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseResponse<void>(response, "Erro ao remover favorito");
}

export async function getCommentsApi(token: string, movieId: number): Promise<CommentItem[]> {
  const response = await fetch(`${API_BASE_URL}/comment/${movieId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse<{ comments?: CommentItem[] }>(response, "Erro ao buscar comentários");
  return data.comments || [];
}

export async function addCommentApi(
  token: string,
  tmdbMovieId: number,
  texto: string
): Promise<CommentItem> {
  const response = await fetch(`${API_BASE_URL}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tmdbMovieId, texto }),
  });

  const data = await parseResponse<{ newComment: CommentItem }>(response, "Erro ao adicionar comentário");
  return data.newComment;
}

export async function deleteCommentApi(token: string, commentId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comment/delete/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseResponse<void>(response, "Erro ao deletar comentário");
}
