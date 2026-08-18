import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
  async authenticate(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValuePassword = await compare(password, user.senhaHash);

    if (!isValuePassword) {
      return res.status(401).json({ message: "Password invalid" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const { id } = user;

    return res.json({ user: { id, email }, token });
  }
}
