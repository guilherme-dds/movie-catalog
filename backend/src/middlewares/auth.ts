import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token invalid" });
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string" || typeof decoded.id !== "number") {
      return res.status(401).json({ error: "Token invalid" });
    }

    req.userId = decoded.id;

    next();
  } catch {
    return res.status(401).json({ error: "Token invalid" });
  }
}
