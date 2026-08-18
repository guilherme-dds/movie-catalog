import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { hash } from "bcryptjs";

export class UserController {
  async index(req: Request, res: Response) {
    const users = await prisma.usuario.findMany();
    return res.json({ users });
  }

  async store(req: Request, res: Response) {
    const { nome, email, password } = req.body;

    const hash_password = await hash(password, 0);

    const userExists = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      return res.status(404).json({ error: "User exists" });
    }

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: hash_password,
      },
    });

    return res.status(201).json({ user });
  }
}
