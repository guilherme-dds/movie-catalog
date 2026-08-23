import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { hash } from "bcryptjs";

export class UserController {
  async index(req: Request, res: Response) {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
      },
    });
    return res.json({ users });
  }

  async store(req: Request, res: Response) {
    const { nome, email, password, role } = req.body;

    if (!email || !password || !nome) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
    }

    const hash_password = await hash(password, 8);

    const userExists = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      return res.status(400).json({ error: "User exists" });
    }

    const userRole = role === "admin" ? "admin" : "user";

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: hash_password,
        role: userRole,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
      },
    });

    return res.status(201).json({ user });
  }
}
