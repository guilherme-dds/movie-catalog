import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { logEvent } from "../utils/logger.js";

export class CommentController {
  async store(req: Request, res: Response) {
    const { tmdbMovieId, texto } = req.body;
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (!texto || typeof texto !== "string" || texto.trim().length === 0) {
      return res.status(400).json({ error: "O texto do comentário é obrigatório." });
    }

    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });

      if (!user?.isPremium) {
        const count = await prisma.comentario.count({
          where: { usuarioId: userId },
        });

        if (count >= 5) {
          return res.status(403).json({
            error: "Limite de 5 comentários atingido no Plano Gratuito. Torne-se Premium para comentar e favoritar sem limites!",
            limitReached: true,
          });
        }
      }

      const newComment = await prisma.comentario.create({
        data: {
          usuarioId: userId,
          tmdbMovieId: Number(tmdbMovieId),
          texto: texto.trim(),
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              fotoPerfil: true,
              isPremium: true,
            },
          },
        },
      });

      await logEvent({ userId, acao: "CREATE_COMMENT", req });

      return res.status(201).json({ newComment });
    } catch (error: any) {
      console.error("Erro ao criar comentário:", error);
      await logEvent({ userId, acao: "ERROR", req });
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  async commentList(req: Request, res: Response) {
    const movieId = Number(req.params.movieId);
    const { userId } = req;

    try {
      const comments = await prisma.comentario.findMany({
        where: {
          tmdbMovieId: movieId,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              fotoPerfil: true,
              isPremium: true,
            },
          },
        },
        orderBy: {
          criadoEm: "desc",
        },
      });

      return res.status(200).json({ comments });
    } catch (error: any) {
      console.error("Erro ao listar comentários:", error);
      await logEvent({ userId, acao: "ERROR", req });
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  async allCommentsAdmin(req: Request, res: Response) {
    const { userId } = req;
    try {
      const comments = await prisma.comentario.findMany({
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              fotoPerfil: true,
              isPremium: true,
            },
          },
        },
        orderBy: {
          criadoEm: "desc",
        },
      });

      return res.status(200).json({ comments });
    } catch (error) {
      await logEvent({ userId, acao: "ERROR", req });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { userId, userRole } = req;

    try {
      const comment = await prisma.comentario.findUnique({
        where: { id },
      });

      if (!comment) {
        return res.status(404).json({ error: "Comentário não encontrado" });
      }

      const isAdmin = userRole?.toLowerCase() === "admin";
      const isOwner = comment.usuarioId === userId;

      if (!isOwner && !isAdmin) {
        await logEvent({ userId, acao: "PERMISSION_DENIED", req });
        return res.status(403).json({ error: "Você não tem permissão para deletar este comentário." });
      }

      await prisma.comentario.delete({
        where: {
          id,
        },
      });

      await logEvent({ userId, acao: "DELETE_COMMENT", req });

      return res.status(200).json({ message: "Comment successfully deleted" });
    } catch (error) {
      await logEvent({ userId, acao: "ERROR", req });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
