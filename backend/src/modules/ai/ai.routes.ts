import { Router }       from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { adminAiChat, publicAiChat }  from "./ai.controller";
import rateLimit        from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60_000,
  max:      30,
  message:  { reply: "Trop de messages, réessayez dans un instant." },
});

export const aiAdminRouter = Router();
aiAdminRouter.use(authenticate);
aiAdminRouter.post("/chat", limiter, adminAiChat);

export const aiRouter = Router();
aiRouter.post("/chat", limiter, publicAiChat);
