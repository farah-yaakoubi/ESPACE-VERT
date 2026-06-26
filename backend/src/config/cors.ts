// src/config/cors.ts
import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const configured = process.env.FRONTEND_URL?.trim();
    const allowed = (configured && configured.length > 0
      ? configured
      : "http://localhost:3000,http://localhost:3001")
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
