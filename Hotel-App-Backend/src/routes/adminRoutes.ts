import { Router } from "express"
import { getDashboardStats, getAllAdminBookings,getAdminBookingById} from "../controllers/adminController"
import { getAllReviews } from "../controllers/reviewController"
import { requiresLogin, requiresAdmin } from "../middleware/authMiddleware"
import { sendNotification } from "../controllers/notificationsController"

const admin_router = Router()
admin_router.get("/dashboard", requiresLogin, requiresAdmin, getDashboardStats)
admin_router.get("/bookings", requiresLogin, requiresAdmin, getAllAdminBookings)
admin_router.get("/bookings/:id", requiresLogin, requiresAdmin, getAdminBookingById)
admin_router.post("/admin/send",requiresLogin,requiresAdmin,sendNotification)
// Admin can view all reviews
admin_router.get("/reviews", requiresLogin, requiresAdmin, getAllReviews)

export default admin_router
