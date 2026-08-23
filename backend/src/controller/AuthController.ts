import type { Request, Response } from "express";

export class AuthController {
  async authenticate(req: Request, res: Response) {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3334";

    try {
      const response = await fetch(`${authServiceUrl}/auth/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Non-JSON response from auth-service:", text);
        return res.status(500).json({ error: "Invalid response format from auth-service" });
      }

      return res.status(response.status).json(data);
    } catch (error) {
      console.error("Error connecting to internal auth-service:", error);
      return res.status(500).json({ error: "Auth service unavailable" });
    }
  }

  async refresh(req: Request, res: Response) {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3334";

    try {
      const response = await fetch(`${authServiceUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Non-JSON response from auth-service:", text);
        return res.status(500).json({ error: "Invalid response format from auth-service" });
      }

      return res.status(response.status).json(data);
    } catch (error) {
      console.error("Error connecting to internal auth-service:", error);
      return res.status(500).json({ error: "Auth service unavailable" });
    }
  }

  async reset(req: Request, res: Response) {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3334";

    try {
      const response = await fetch(`${authServiceUrl}/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Non-JSON response from auth-service:", text);
        return res.status(500).json({ error: "Invalid response format from auth-service" });
      }

      return res.status(response.status).json(data);
    } catch (error) {
      console.error("Error connecting to internal auth-service:", error);
      return res.status(500).json({ error: "Auth service unavailable" });
    }
  }

  async resetConfirm(req: Request, res: Response) {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3334";

    try {
      const response = await fetch(`${authServiceUrl}/auth/reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Non-JSON response from auth-service:", text);
        return res.status(500).json({ error: "Invalid response format from auth-service" });
      }

      return res.status(response.status).json(data);
    } catch (error) {
      console.error("Error connecting to internal auth-service:", error);
      return res.status(500).json({ error: "Auth service unavailable" });
    }
  }
}
