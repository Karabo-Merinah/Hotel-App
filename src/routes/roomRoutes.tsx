import { Router } from "express";
import {getHotelRooms,getRoomById,createRoom,updateRoom,deleteRoom} from "../controllers/roomController";
import { requiresLogin,requiresAdmin} from "../middleware/authMiddleware";

const room_router = Router();

// Public routes
room_router.get("/hotel/:hotelId", getHotelRooms);
room_router.get("/:id", getRoomById);

// Admin routes
room_router.post("/", requiresLogin, requiresAdmin, createRoom);
room_router.put("/:id", requiresLogin, requiresAdmin, updateRoom);
room_router.delete("/:id", requiresLogin, requiresAdmin, deleteRoom);

export default room_router;
