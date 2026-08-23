import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export class FavoriteController {
  async store(req: Request, res: Response) {
    const { tmdbMovieId, titulo, posterPath } = req.body;
    const { userId } = req;

    if (!tmdbMovieId || !titulo) {
      return res.status(400).json({ error: "tmdbMovieId e titulo são obrigatórios." });
    }

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const movieIdNum = Number(tmdbMovieId);

    try {
      const existingFav = await prisma.favorito.findFirst({
        where: {
          usuarioId: userId,
          tmdbMovieId: movieIdNum,
        },
      });

      if (existingFav) {
        return res.status(200).json({ newFavorite: existingFav });
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
      return res.status(500).json({ error: "Internal server error", message: error?.message });
    }
  }

  async favoriteList(req: Request, res: Response) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const favoriteList = await prisma.favorito.findMany({
        where: {
          usuarioId: userId,
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

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const favorite = await prisma.favorito.findFirst({
        where: {
          usuarioId: userId,
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
