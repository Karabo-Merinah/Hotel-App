import { Router } from "express";
import {getHotelRooms,getRoomById,createRoom,updateRoom,deleteRoom, addRoomImage,deleteRoomImage} from "../controllers/roomController";
import { requiresLogin,requiresAdmin} from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware"

const room_router = Router();

// Public routes
room_router.get("/hotel/:hotelId", getHotelRooms);
room_router.get("/:id", getRoomById);

// Admin routes
room_router.post("/", requiresLogin, requiresAdmin, createRoom);
room_router.put("/:id", requiresLogin, requiresAdmin, updateRoom);
room_router.delete("/:id", requiresLogin, requiresAdmin, deleteRoom);
room_router.post("/:id/images", requiresLogin, requiresAdmin, upload.single("image"), addRoomImage);
room_router.delete("/images/:imageId", requiresLogin, requiresAdmin, deleteRoomImage);
export default room_router;
