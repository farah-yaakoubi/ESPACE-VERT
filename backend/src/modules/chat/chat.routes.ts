// src/modules/chat/chat.routes.ts
import { Router }       from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl        from "./chat.controller";

export const chatRouter = Router();
chatRouter.use(authenticate);

// SSE temps réel
chatRouter.get("/events",              ctrl.sseEvents);

// Lectures
chatRouter.get("/unread",              ctrl.getUnread);
chatRouter.get("/conversations",       ctrl.getConversations);
chatRouter.get("/:id_other",           ctrl.getMessages);

// Envoi texte
chatRouter.post("/:id_other",          ctrl.sendMessage);

// Envoi fichier/image/PDF
chatRouter.post("/:id_other/upload",   ctrl.sendFileMessage);

// Marquer comme lu
chatRouter.patch("/:id_other/read",    ctrl.markRead);
