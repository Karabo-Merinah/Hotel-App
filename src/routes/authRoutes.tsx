import { Router } from "express";
import { registerUser, loginUser, getCurrentLoggedUser } from "../controllers/authenticateController";
import { requiresLogin } from "../middleware/authMiddleware";

const auth_router = Router()

auth_router.post("/register", registerUser)
auth_router.post("/login", loginUser)
auth_router.get("/me", requiresLogin, getCurrentLoggedUser)

export default auth_router 