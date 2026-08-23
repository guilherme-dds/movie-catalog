export interface User {
  id: string;
  nome?: string;
  email: string;
  role?: "admin" | "user" | string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

export interface FavoriteItem {
  id: number;
  usuarioId: string;
  tmdbMovieId: number;
  titulo: string;
  posterPath: string | null;
  criadoEm?: string;
}

export interface CommentItem {
  id: number;
  usuarioId: string;
  tmdbMovieId: number;
  texto: string;
  criadoEm?: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  character?: string;
  popularity?: number;
  genre_ids?: number[];
}

export interface TMDBPerson {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
}

export interface TMDBPersonSearchResponse {
  page: number;
  results: TMDBPerson[];
  total_results: number;
  total_pages: number;
}

export interface TMDBMovieCreditsResponse {
  id: number;
  cast: TMDBMovie[];
  crew?: TMDBMovie[];
}
