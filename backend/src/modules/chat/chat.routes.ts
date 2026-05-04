import { Router }       from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl        from "./chat.controller";

export const chatRouter = Router();
chatRouter.use(authenticate);

chatRouter.get("/unread",        ctrl.getUnread);
chatRouter.get("/conversations", ctrl.getConversations);
chatRouter.get("/:id_other",     ctrl.getMessages);
chatRouter.post("/:id_other",    ctrl.sendMessage);