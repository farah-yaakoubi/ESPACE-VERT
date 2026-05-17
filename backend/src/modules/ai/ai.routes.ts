// src/modules/ai/ai.routes.ts
import { Router }   from "express";
import { aiChat, aiRecommendSemences } from "./ai.controller";
import rateLimit    from "express-rate-limit";

const chatLimiter = rateLimit({
  windowMs: 60_000,
  max:      20,
  message:  { error: "Trop de messages, réessayez dans un instant." },
});

const recommendLimiter = rateLimit({
  windowMs: 60_000,
  max:      10,
  message:  { error: "Trop de requêtes, réessayez dans un instant." },
});

export const aiRouter = Router();
aiRouter.post("/chat",               chatLimiter,      aiChat);
aiRouter.post("/recommend-semences", recommendLimiter, aiRecommendSemences);
