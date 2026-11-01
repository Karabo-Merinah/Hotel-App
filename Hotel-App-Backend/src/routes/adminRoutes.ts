import { Router } from "express"
import { getDashboardStats } from "../controllers/adminController"
import { requiresLogin, requiresAdmin } from "../middleware/authMiddleware"

const admin_router = Router()
admin_router.get("/dashboard", requiresLogin, requiresAdmin, getDashboardStats)
export default admin_router
