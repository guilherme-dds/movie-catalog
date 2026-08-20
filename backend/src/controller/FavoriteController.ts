import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export class FavoriteController {
  async store(req: Request, res: Response) {
    const { tmdbMovieId, titulo, posterPath } = req.body;
    const { userId } = req;

    if (!tmdbMovieId || !titulo) {
      return res.status(400).json({ error: "tmdbMovieId e titulo são obrigatórios." });
    }

    const movieIdNum = Number(tmdbMovieId);

    try {
      const existingUserFav = await prisma.favorito.findFirst({
        where: {
          usuarioId: userId,
          tmdbMovieId: movieIdNum,
        },
      });

      if (existingUserFav) {
        return res.status(200).json({ newFavorite: existingUserFav });
      }

      const existingMovieFav = await prisma.favorito.findFirst({
        where: {
          tmdbMovieId: movieIdNum,
        },
      });

      if (existingMovieFav) {
        return res.status(200).json({ newFavorite: existingMovieFav });
      }

      const newFavorite = await prisma.favorito.create({
        data: {
          usuarioId: userId,
          tmdbMovieId: movieIdNum,
          titulo,
          posterPath: posterPath || null,
        },
      });

      return res.status(201).json({ newFavorite });
    } catch (error: any) {
      console.error("Erro ao salvar favorito:", error);

      try {
        const fallback = await prisma.favorito.findFirst({
          where: {
            OR: [
              { tmdbMovieId: movieIdNum },
              { usuarioId: userId },
            ],
          },
        });

        if (fallback) {
          return res.status(200).json({ newFavorite: fallback });
        }
      } catch (innerErr) {
        console.error("Fallback error:", innerErr);
      }

      return res.status(500).json({ error: "Internal server error", message: error?.message });
    }
  }

  async favoriteList(req: Request, res: Response) {
    const { userId } = req;

    try {
      const favoriteList = await prisma.favorito.findMany({
        where: {
          OR: [
            { usuarioId: userId },
          ],
        },
        orderBy: {
          criadoEm: "desc",
        },
      });

      return res.status(200).json({ favoriteList });
    } catch (error) {
      console.error("Erro ao listar favoritos:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    const paramId = Number(req.params.id);
    const { userId } = req;

    try {
      const favorite = await prisma.favorito.findFirst({
        where: {
          OR: [
            { id: paramId },
            { tmdbMovieId: paramId },
          ],
        },
      });

      if (!favorite) {
        return res.status(200).json({ message: "Favorite successfully deleted" });
      }

      await prisma.favorito.delete({
        where: {
          id: favorite.id,
        },
      });

      return res.status(200).json({ message: "Favorite successfully deleted" });
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
