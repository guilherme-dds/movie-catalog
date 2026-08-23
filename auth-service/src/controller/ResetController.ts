import type { Request, Response } from "express";
import { MailtrapClient } from "mailtrap";
import { hash } from "bcryptjs";
import prisma from "../utils/prisma.js";

export class ResetController {
  async reset(req: Request, res: Response) {
    try {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: "Email is required" });

      const user = await prisma.usuario.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const tokenRecord = await prisma.resetToken.create({
        data: {
          usuarioId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const frontendUrl =
        process.env.FRONTEND_URL || "https://guilherme-santos-isw055.lapps.studio";
      const resetLink = `${frontendUrl}/reset-password?token=${tokenRecord.token}`;

      // Envio utilizando Mailtrap
      const rawToken = process.env.MAILTRAP_TOKEN || "";
      const TOKEN_API = rawToken.replace(/^["']|["']$/g, "").trim();

      if (!TOKEN_API) {
        console.warn("MAILTRAP_TOKEN is not configured");
        return res.status(500).json({ error: "MAILTRAP_TOKEN is not configured" });
      }

      const client = new MailtrapClient({ token: TOKEN_API });

      const senderEmail = process.env.MAILTRAP_SENDER_EMAIL || "hello@demomailtrap.co";

      const sender = {
        email: senderEmail,
        name: "Movie Catalog",
      };

      const recipients = [
        {
          email: user.email,
          name: user.nome || user.email,
        },
      ];

      await client.send({
        from: sender,
        to: recipients,
        subject: "Movie Catalog - Redefinição de Senha",
        text: `Clique no link a seguir para redefinir sua senha: ${resetLink}`,
      });

      return res.json({ message: "Password reset email sent" });
    } catch (error: any) {
      console.error("Error in reset password controller:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async confirm(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body || {};

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
      }

      const resetTokenRecord = await prisma.resetToken.findUnique({
        where: { token },
        include: { usuario: true },
      });

      if (!resetTokenRecord) {
        return res.status(404).json({ error: "Token de redefinição inválido ou não encontrado." });
      }

      if (resetTokenRecord.usado) {
        return res.status(400).json({ error: "Este token de redefinição já foi utilizado." });
      }

      if (resetTokenRecord.expiresAt < new Date()) {
        return res.status(400).json({ error: "Este token de redefinição expirou." });
      }

      const senhaHash = await hash(newPassword, 8);

      await prisma.usuario.update({
        where: { id: resetTokenRecord.usuarioId },
        data: { senhaHash },
      });

      await prisma.resetToken.update({
        where: { token },
        data: { usado: true },
      });

      return res.json({ message: "Senha alterada com sucesso!" });
    } catch (error: any) {
      console.error("Error in confirm password reset:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
}