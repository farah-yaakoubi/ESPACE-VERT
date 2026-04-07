// src/config/cors.ts
import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.FRONTEND_URL ?? "http://localhost:3000")
      .split(",")
      .map(u => u.trim());

    // Autoriser les requêtes sans origin (Postman, curl, etc.) en dev
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} non autorisée`));
    }
  },
  credentials:    true,
  methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
