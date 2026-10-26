import { Router } from "express";
import { getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel } from "../controllers/hotelController";
import { requiresLogin, requiresAdmin } from "../middleware/authMiddleware";
import { getAllAmenties, addHotelImage, deleteHotelImage, setHotelAmenities } from "../controllers/hotelInformationController";

const hotel_router = Router();

hotel_router.get("/", getAllHotels);
hotel_router.get("/amenities/list", getAllAmenties)
hotel_router.get("/:id", getHotelById);


hotel_router.post("/", requiresLogin, requiresAdmin, createHotel);
hotel_router.put("/:id", requiresLogin, requiresAdmin, updateHotel);
hotel_router.delete("/:id", requiresLogin, requiresAdmin, deleteHotel);
hotel_router.post("/:id/images", requiresLogin, requiresAdmin, addHotelImage)
hotel_router.delete("/images/:imageId", requiresLogin, requiresAdmin, deleteHotelImage)
hotel_router.put("/:id/amenities", requiresLogin, requiresAdmin, setHotelAmenities)

export default hotel_router;
