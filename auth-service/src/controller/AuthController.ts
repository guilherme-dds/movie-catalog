import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

export class AuthController {
  async authenticate(req: Request, res: Response) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

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

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT_SECRET is not configured" });
      }

      // Access token expires in 15 minutes
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "15m",
      });

      // Generate refresh token valid for 7 days
      const refreshTokenValue = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          token: refreshTokenValue,
          usuarioId: user.id,
          expiresAt,
        },
      });

      const { id } = user;

      return res.json({
        user: { id, email },
        token,
        refreshToken: refreshTokenValue,
      });
    } catch (error: any) {
      console.error("Error in auth-service authenticate:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body || {};

      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token is required" });
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { usuario: true },
      });

      if (!storedToken) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        return res.status(401).json({ error: "Refresh token expired" });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT_SECRET is not configured" });
      }

      const newToken = jwt.sign({ id: storedToken.usuarioId }, JWT_SECRET, {
        expiresIn: "15m",
      });

      return res.json({
        token: newToken,
        refreshToken: storedToken.token,
      });
    } catch (error: any) {
      console.error("Error in auth-service refresh:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      let token = req.body?.token;

      if (!token && authHeader) {
        const [type, authToken] = authHeader.split(" ");
        if (type === "Bearer" && authToken) {
          token = authToken;
        }
      }

      if (!token) {
        return res.status(401).json({ valid: false, error: "Token not provided" });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        return res.status(500).json({ valid: false, error: "JWT_SECRET is not configured" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      if (typeof decoded === "string" || typeof decoded.id !== "number") {
        return res.status(401).json({ valid: false, error: "Token invalid" });
      }

      return res.json({ valid: true, userId: decoded.id });
    } catch (error: any) {
      return res.status(401).json({ valid: false, error: error.message || "Token invalid" });
    }
  }
}
