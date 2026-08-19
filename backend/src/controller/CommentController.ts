import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export class CommentController {
  async store(req: Request, res: Response) {
    const { tmdbMovieId, texto } = req.body;
    const { userId } = req;

    try {
      const newComment = await prisma.comentario.create({
        data: {
          usuarioId: userId,
          tmdbMovieId,
          texto,
        },
      });

      return res.status(201).json({ newComment });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async commentList(req: Request, res: Response) {
    const movieId = Number(req.params.movieId);
    const { userId } = req;

    try {
      const comments = await prisma.comentario.findMany({
        where: {
          usuarioId: userId,
          tmdbMovieId: movieId,
        },
      });

      return res.status(200).json({ comments });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      const deleteComment = await prisma.comentario.delete({
        where: {
          id,
        },
      });

      return res.status(200).json({ message: "Comment successfully deleted" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
