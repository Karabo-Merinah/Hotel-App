import { Router } from "express"
import { getDashboardStats, getAllAdminBookings,getAdminBookingById,updateAdminBookingStatus } from "../controllers/adminController"
import { requiresLogin, requiresAdmin } from "../middleware/authMiddleware"

const admin_router = Router()
admin_router.get("/dashboard", requiresLogin, requiresAdmin, getDashboardStats)
admin_router.get("/bookings", requiresLogin, requiresAdmin, getAllAdminBookings)
admin_router.get("/bookings/:id", requiresLogin, requiresAdmin, getAdminBookingById)
admin_router.put("/bookings/:id/status", requiresLogin, requiresAdmin, updateAdminBookingStatus)

export default admin_router
