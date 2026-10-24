import { Router } from "express";
import { updateProfile } from "../controllers/userControllers";
import { requiresLogin } from "../middleware/authMiddleware";

const user_router = Router()

user_router.put("/me", requiresLogin, updateProfile)

export default user_router