
import { Router } from "express";
import {getAllHotels,getHotelById,createHotel,updateHotel,deleteHotel} from "../controllers/hotelController";
import {requiresLogin,requiresAdmin} from "../middleware/authMiddleware";

const hotel_router = Router();

hotel_router.get("/", getAllHotels);
hotel_router.get("/:id", getHotelById);

hotel_router.post("/", requiresLogin, requiresAdmin, createHotel);
hotel_router.put("/:id", requiresLogin, requiresAdmin, updateHotel);
hotel_router.delete("/:id", requiresLogin, requiresAdmin, deleteHotel);

export default hotel_router;
