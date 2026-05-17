import { Router }       from "express";
import { authenticate } from "../../middleware/authMiddleware";
import * as ctrl        from "./notifications.controller";

export const notifRouter = Router();
notifRouter.use(authenticate);

// SSE temps réel (doit être avant les routes /:id)
notifRouter.get("/events",        ctrl.sseEvents);

notifRouter.get("/",              ctrl.list);
notifRouter.patch("/read-all",    ctrl.markAllRead);
notifRouter.delete("/clear-read", ctrl.clearRead);
notifRouter.patch("/:id/lu",      ctrl.markRead);
notifRouter.delete("/:id",        ctrl.remove);