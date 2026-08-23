import express from "express";
import cors from "cors";
import "dotenv/config";
import { router } from "./routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use(router);

const PORT = process.env.PORT || 3334;

app.listen(PORT, () => {
  console.log(`Auth Service is running on internal port ${PORT}`);
});
