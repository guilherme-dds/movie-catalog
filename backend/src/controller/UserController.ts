import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export class UserController {
  async index(req: Request, res: Response) {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        bio: true,
        criadoEm: true,
      },
    });
    return res.json({ users });
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          bio: true,
          criadoEm: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      return res.json({ user });
    } catch (error: any) {
      console.error("Erro ao buscar perfil:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      const { bio, nome } = req.body || {};

      const dataToUpdate: Record<string, any> = {};
      if (typeof bio === "string") {
        dataToUpdate.bio = bio.trim();
      }
      if (typeof nome === "string" && nome.trim().length > 0) {
        dataToUpdate.nome = nome.trim();
      }

      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          bio: true,
          criadoEm: true,
        },
      });

      return res.json({ user: updatedUser, message: "Perfil atualizado com sucesso." });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      return res.status(500).json({ error: "Erro ao atualizar perfil do usuário." });
    }
  }
}
