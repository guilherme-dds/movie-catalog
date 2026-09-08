import type { Request } from "express";
import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const STREAM_KEY = "logs:stream";

const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) return null;
    return 1000;
  },
});

redis.on("error", () => {
  // Silent catch to prevent crashing app if Redis is unreachable
});

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const firstIp = forwarded.split(",")[0];
    if (firstIp) return firstIp.trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    const firstIp = forwarded[0];
    if (firstIp) return firstIp.trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") {
    return realIp.trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

export async function logEvent({
  userId,
  acao,
  req,
}: {
  userId?: string | number | null;
  acao: string;
  req: Request;
}) {
  try {
    const ip = getClientIp(req);
    const timestamp = new Date().toISOString();
    const user_id = userId ? String(userId) : "anonymous";

    if (redis.status !== "ready" && redis.status !== "connecting") {
      await redis.connect().catch(() => {});
    }

    await redis.xadd(
      STREAM_KEY,
      "*",
      "user_id",
      user_id,
      "acao",
      acao,
      "timestamp",
      timestamp,
      "ip",
      ip
    );
  } catch (err: any) {
    console.error(`[LOGGER WARNING] Falha ao enviar log XADD (${acao}):`, err?.message || err);
  }
}
