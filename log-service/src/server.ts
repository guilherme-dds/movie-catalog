import express from "express";
import cors from "cors";
import "dotenv/config";
import { Redis } from "ioredis";

const app = express();
app.use(express.json());
app.use(cors());

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const PORT = process.env.PORT || 3335;
const STREAM_KEY = "logs:stream";

export interface LogEntry {
  id: string;
  user_id: string;
  acao: string;
  timestamp: string;
  ip: string;
}

const memoryLogs: LogEntry[] = [];
const seenIds = new Set<string>();

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 1000, 5000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log(`[log-service] Conectado ao Redis em ${REDIS_URL}`);
});

redis.on("error", (err) => {
  console.error("[log-service] Erro no Redis:", err.message);
});

function parseStreamMessage(id: string, fields: string[]): LogEntry {
  const data: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    const key = fields[i];
    const val = fields[i + 1];
    if (key && val !== undefined) {
      data[key] = val;
    }
  }

  return {
    id,
    user_id: data.user_id || "anonymous",
    acao: data.acao || "UNKNOWN",
    timestamp: data.timestamp || new Date().toISOString(),
    ip: data.ip || "unknown",
  };
}

async function startStreamConsumer() {
  let lastId = "0-0";

  while (true) {
    try {
      // Blocking read from Redis Stream
      const result = await redis.xread("BLOCK", 2000, "STREAMS", STREAM_KEY, lastId) as [string, [string, string[]][]][] | null;

      if (result) {
        for (const [streamName, messages] of result) {
          for (const [id, fields] of messages) {
            lastId = id;
            if (!seenIds.has(id)) {
              seenIds.add(id);
              const logEntry = parseStreamMessage(id, fields);
              memoryLogs.push(logEntry);
              console.log(`[LOG-SERVICE XADD RECORD] id=${id} | user_id=${logEntry.user_id} | acao=${logEntry.acao} | ip=${logEntry.ip} | timestamp=${logEntry.timestamp}`);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("[log-service] Erro ao consumir Redis Stream:", err.message);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

app.get("/health", async (req, res) => {
  res.json({ status: "ok", redisStatus: redis.status, totalLogs: memoryLogs.length });
});

app.get("/logs", async (req, res) => {
  try {
    const rawStream = await redis.xrange(STREAM_KEY, "-", "+");
    const streamLogs: LogEntry[] = rawStream.map(([id, fields]) => parseStreamMessage(id, fields as string[]));

    res.json({
      count: streamLogs.length,
      logs: streamLogs.length > 0 ? streamLogs : memoryLogs,
    });
  } catch (err: any) {
    res.json({ count: memoryLogs.length, logs: memoryLogs });
  }
});

app.get("/api/logs", async (req, res) => {
  try {
    const rawStream = await redis.xrange(STREAM_KEY, "-", "+");
    const streamLogs: LogEntry[] = rawStream.map(([id, fields]) => parseStreamMessage(id, fields as string[]));

    res.json({
      count: streamLogs.length,
      logs: streamLogs.length > 0 ? streamLogs : memoryLogs,
    });
  } catch (err: any) {
    res.json({ count: memoryLogs.length, logs: memoryLogs });
  }
});

app.listen(PORT, () => {
  console.log(`[log-service] Rodando na porta ${PORT}`);
  startStreamConsumer().catch((err) => console.error("Consumer loop failed:", err));
});
