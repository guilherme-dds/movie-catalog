import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export async function AuthMiddleware(
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

  const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3334";

  try {
    const response = await fetch(`${authServiceUrl}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({ token }),
    });

    const data = (await response.json()) as { valid?: boolean; userId?: number; error?: string };

    if (response.ok && data.valid && typeof data.userId === "number") {
      req.userId = data.userId;
      return next();
    }

    return res.status(401).json({ error: data.error || "Token invalid" });
  } catch (error) {
    console.error("Error verifying token with auth-service:", error);

    // Fallback to local JWT verification if available
    const JWT_SECRET = process.env.JWT_SECRET;
    if (JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded !== "string" && typeof decoded.id === "number") {
          req.userId = decoded.id;
          return next();
        }
      } catch {}
    }

    return res.status(401).json({ error: "Token invalid" });
  }
}

