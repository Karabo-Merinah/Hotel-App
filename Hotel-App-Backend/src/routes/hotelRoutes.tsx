import { Router } from "express";
import { getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel, getHotelSearchOptions } from "../controllers/hotelController";
import { requiresLogin, requiresAdmin } from "../middleware/authMiddleware";
import { getAllAmenties, addHotelImage, deleteHotelImage, setHotelAmenities } from "../controllers/hotelInformationController";
import upload from "../middleware/uploadMiddleware"

const hotel_router = Router();

// Get all hotels
hotel_router.get("/", getAllHotels);

// Get all amenities
hotel_router.get("/amenities/list", getAllAmenties)

// Get maximum guest and room options for the search dropdowns
hotel_router.get("/search-options", getHotelSearchOptions)

// Get hotel details by ID
hotel_router.get("/:id", getHotelById);

// Admin hotel management
hotel_router.post("/", requiresLogin, requiresAdmin, createHotel);
hotel_router.put("/:id", requiresLogin, requiresAdmin, updateHotel);
hotel_router.delete("/:id", requiresLogin, requiresAdmin, deleteHotel);

// Admin hotel image management
hotel_router.post("/:id/images", requiresLogin, requiresAdmin, upload.single("image"), addHotelImage)
hotel_router.delete("/images/:imageId", requiresLogin, requiresAdmin, deleteHotelImage)

// Admin hotel amenities management
hotel_router.put("/:id/amenities", requiresLogin, requiresAdmin, setHotelAmenities)

export default hotel_router;
