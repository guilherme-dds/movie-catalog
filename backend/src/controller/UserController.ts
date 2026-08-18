import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export class UserController {
  async index(req: Request, res: Response) {
    const users = await prisma.usuario.findMany();
    return res.json({ users });
  }
}
