import { Router } from "express";
import { changePassword, getProfile, updateProfile } from "../controllers/userControllers";
import { requiresLogin } from "../middleware/authMiddleware";

const user_router = Router()

user_router.put("/me", requiresLogin, updateProfile)
user_router.get("/me",requiresLogin,getProfile)
user_router.put("/me/password",requiresLogin,changePassword)
export default user_router