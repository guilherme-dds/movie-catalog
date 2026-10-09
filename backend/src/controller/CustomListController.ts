import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { logEvent } from "../utils/logger.js";

export class CustomListController {
  async create(req: Request, res: Response) {
    const { userId } = req;
    const { nome, descricao } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
      return res.status(400).json({ error: "O nome da lista é obrigatório." });
    }

    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });

      if (!user?.isPremium) {
        return res.status(403).json({
          error: "Recurso exclusivo do Plano Premium. Assine o Plano Premium para criar listas personalizadas com nomes customizados!",
        });
      }

      const list = await prisma.listaPersonalizada.create({
        data: {
          usuarioId: userId,
          nome: nome.trim(),
          descricao: descricao ? String(descricao).trim() : null,
        },
        include: {
          itens: true,
        },
      });

      await logEvent({ userId, acao: "CREATE_CUSTOM_LIST", req });

      return res.status(201).json({ list });
    } catch (error: any) {
      console.error("Erro ao criar lista personalizada:", error);
      await logEvent({ userId, acao: "ERROR", req });
      return res.status(500).json({ error: "Erro ao criar lista personalizada." });
    }
  }

  async index(req: Request, res: Response) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const lists = await prisma.listaPersonalizada.findMany({
        where: { usuarioId: userId },
        include: {
          itens: true,
        },
        orderBy: {
          criadoEm: "desc",
        },
      });

      return res.status(200).json({ lists });
    } catch (error: any) {
      console.error("Erro ao listar listas personalizadas:", error);
      return res.status(500).json({ error: "Erro ao carregar listas personalizadas." });
    }
  }

  async addItem(req: Request, res: Response) {
    const { userId } = req;
    const listId = Number(req.params.id);
    const { tmdbMovieId, titulo, posterPath } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (!tmdbMovieId || !titulo) {
      return res.status(400).json({ error: "tmdbMovieId e titulo são obrigatórios." });
    }

    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });

      if (!user?.isPremium) {
        return res.status(403).json({
          error: "Recurso exclusivo do Plano Premium. Assine o Plano Premium para gerenciar listas personalizadas!",
        });
      }

      const list = await prisma.listaPersonalizada.findFirst({
        where: { id: listId, usuarioId: userId },
      });

      if (!list) {
        return res.status(404).json({ error: "Lista personalizada não encontrada." });
      }

      const movieIdNum = Number(tmdbMovieId);

      const existingItem = await prisma.itemListaPersonalizada.findFirst({
        where: {
          listaPersonalizadaId: listId,
          tmdbMovieId: movieIdNum,
        },
      });

      if (existingItem) {
        return res.status(200).json({ item: existingItem });
      }

      const item = await prisma.itemListaPersonalizada.create({
        data: {
          listaPersonalizadaId: listId,
          tmdbMovieId: movieIdNum,
          titulo: String(titulo).trim(),
          posterPath: posterPath ? String(posterPath) : null,
        },
      });

      await logEvent({ userId, acao: "ADD_ITEM_CUSTOM_LIST", req });

      return res.status(201).json({ item });
    } catch (error: any) {
      console.error("Erro ao adicionar filme à lista personalizada:", error);
      return res.status(500).json({ error: "Erro ao adicionar filme à lista." });
    }
  }

  async removeItem(req: Request, res: Response) {
    const { userId } = req;
    const listId = Number(req.params.id);
    const movieIdNum = Number(req.params.movieId);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const list = await prisma.listaPersonalizada.findFirst({
        where: { id: listId, usuarioId: userId },
      });

      if (!list) {
        return res.status(404).json({ error: "Lista não encontrada." });
      }

      await prisma.itemListaPersonalizada.deleteMany({
        where: {
          listaPersonalizadaId: listId,
          tmdbMovieId: movieIdNum,
        },
      });

      return res.status(200).json({ message: "Filme removido da lista com sucesso." });
    } catch (error: any) {
      console.error("Erro ao remover filme da lista personalizada:", error);
      return res.status(500).json({ error: "Erro ao remover filme da lista." });
    }
  }

  async delete(req: Request, res: Response) {
    const { userId } = req;
    const listId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const list = await prisma.listaPersonalizada.findFirst({
        where: { id: listId, usuarioId: userId },
      });

      if (!list) {
        return res.status(404).json({ error: "Lista não encontrada." });
      }

      await prisma.listaPersonalizada.delete({
        where: { id: listId },
      });

      await logEvent({ userId, acao: "DELETE_CUSTOM_LIST", req });

      return res.status(200).json({ message: "Lista personalizada excluída com sucesso." });
    } catch (error: any) {
      console.error("Erro ao excluir lista personalizada:", error);
      return res.status(500).json({ error: "Erro ao excluir lista." });
    }
  }
}
