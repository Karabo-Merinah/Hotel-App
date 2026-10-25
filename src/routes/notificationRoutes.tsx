import { Router } from "express";
import { getMyNotifications,markedAsRead,markAllNotificationsRead } from "../controllers/notificationsController";
import { requiresLogin } from "../middleware/authMiddleware";

const notification_router=Router()

notification_router.get("/",requiresLogin,getMyNotifications)
notification_router.put("/read-all",requiresLogin,markAllNotificationsRead)
notification_router.put("/:id/read",requiresLogin,markedAsRead)

export default notification_router