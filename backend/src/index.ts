import "dotenv/config";
import express   from "express";
import cors      from "cors";
import helmet    from "helmet";
import morgan    from "morgan";
import rateLimit from "express-rate-limit";

import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes                 from "./routes/admin/auth.routes";

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
app.use(morgan("dev"));

app.use(cors({
  origin:         process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials:    true,
  methods:        ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { error: "Trop de tentatives, réessayez dans 15 minutes" },
});

app.use("/api/admin/auth", authLimiter, authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Backend Espace Vert démarré`);
  console.log(`   URL  : http://localhost:${PORT}`);
  console.log(`   ENV  : ${process.env.NODE_ENV}\n`);
});

export default app;