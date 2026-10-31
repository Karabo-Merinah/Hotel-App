import { Router } from "express"
import { createPayment, verifyPayment } from "../controllers/paymentController"
import { requiresLogin } from "../middleware/authMiddleware"

const payment_router = Router()

payment_router.post("/", requiresLogin, createPayment)
payment_router.get("/verify/:reference", requiresLogin, verifyPayment)

export default payment_router