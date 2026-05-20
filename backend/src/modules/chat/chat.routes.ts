import { Router } from "express";
import { authenticate, requireSuperAdmin } from "../../middleware/authMiddleware";
import * as ctrl from "./chat.controller";

export const chatRouter = Router();
chatRouter.use(authenticate);

// SSE
chatRouter.get("/events", ctrl.sseEvents);

// Référentiels chat
chatRouter.get("/available-admins", ctrl.getAvailableAdmins);
chatRouter.get("/trace", requireSuperAdmin, ctrl.getTrace);

// Groupes
chatRouter.get("/groups", ctrl.getGroups);
chatRouter.post("/groups", ctrl.createGroup);
chatRouter.get("/groups/:id_group", ctrl.getGroupMessages);
chatRouter.post("/groups/:id_group/messages", ctrl.sendGroupMessage);
chatRouter.post("/groups/:id_group/messages/upload", ctrl.sendGroupFileMessage);
chatRouter.patch("/groups/:id_group/read", ctrl.markGroupRead);

// Actions sur messages directs
chatRouter.patch("/message/:id_msg", ctrl.updateMessage);
chatRouter.delete("/message/:id_msg", ctrl.deleteMessage);
chatRouter.post("/message/:id_msg/thumb", ctrl.toggleThumb);

// Actions sur messages de groupe
chatRouter.patch("/group-message/:id_msg", ctrl.updateGroupMessage);
chatRouter.delete("/group-message/:id_msg", ctrl.deleteGroupMessage);
chatRouter.post("/group-message/:id_msg/thumb", ctrl.toggleGroupThumb);

// Lectures
chatRouter.get("/unread", ctrl.getUnread);
chatRouter.get("/conversations", ctrl.getConversations);
chatRouter.get("/:id_other", ctrl.getMessages);

// Envoi direct
chatRouter.post("/:id_other", ctrl.sendMessage);
chatRouter.post("/:id_other/upload", ctrl.sendFileMessage);
chatRouter.patch("/:id_other/read", ctrl.markRead);
