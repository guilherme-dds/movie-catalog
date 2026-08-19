import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export class FavoriteController {
  async store(req: Request, res: Response) {
    const { tmdbMovieId, titulo, posterPath } = req.body;
    const { userId } = req;

    try {
      const newFavorite = await prisma.favorito.create({
        data: {
          usuarioId: userId,
          tmdbMovieId,
          titulo,
          posterPath,
        },
      });

      return res.status(201).json({ newFavorite });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async favoriteList(req: Request, res: Response) {
    const { userId } = req;

    try {
      const favoriteList = await prisma.favorito.findMany({
        where: {
          usuarioId: userId,
        },
      });

      return res.status(200).json({ favoriteList });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      const deleteFavorite = await prisma.favorito.delete({
        where: {
          id,
        },
      });

      return res.status(200).json({ message: "Favorite successfully deleted" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
