import type { TMDBMovie, TMDBPersonSearchResponse, TMDBMovieCreditsResponse } from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export function getTMDBApiKey(): string {
  return (import.meta.env.VITE_TMDB_API_KEY as string) || "";
}

export function getImageUrl(path: string | null, size = "w500"): string {
  if (!path) {
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function fetchTomHanksMovies(): Promise<TMDBMovie[]> {
  const apiKey = getTMDBApiKey();

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "TMDB API Key não configurada. Por favor, adicione a variável VITE_TMDB_API_KEY no arquivo .env da pasta frontend."
    );
  }

  // 1. Search for Tom Hanks (/search/person?query=Tom+Hanks)
  const searchUrl = `${TMDB_BASE_URL}/search/person?query=Tom+Hanks&language=pt-BR&api_key=${encodeURIComponent(apiKey.trim())}`;
  const searchRes = await fetch(searchUrl);

  if (!searchRes.ok) {
    if (searchRes.status === 401) {
      throw new Error("Chave da API do TMDB inválida ou não autorizada (Status 401). Verifique a variável VITE_TMDB_API_KEY no arquivo .env.");
    }
    throw new Error(`Erro ao buscar pessoa no TMDB (Status ${searchRes.status}).`);
  }

  const searchData: TMDBPersonSearchResponse = await searchRes.json();
  const tomHanks = searchData.results?.find(
    (p) => p.name.toLowerCase().includes("tom hanks") || p.id === 31
  ) || searchData.results?.[0];

  if (!tomHanks) {
    throw new Error("Pessoa 'Tom Hanks' não foi encontrada na busca da API do TMDB.");
  }

  // 2. Fetch credits (/person/{person_id}/movie_credits)
  const creditsUrl = `${TMDB_BASE_URL}/person/${tomHanks.id}/movie_credits?language=pt-BR&api_key=${encodeURIComponent(apiKey.trim())}`;
  const creditsRes = await fetch(creditsUrl);

  if (!creditsRes.ok) {
    throw new Error(`Erro ao carregar créditos de filmes no TMDB (Status ${creditsRes.status}).`);
  }

  const creditsData: TMDBMovieCreditsResponse = await creditsRes.json();
  const castMovies = creditsData.cast || [];

  // Filter movies with valid title and sort by popularity
  const sortedMovies = castMovies
    .filter((m) => m.title && m.release_date)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return sortedMovies;
}
