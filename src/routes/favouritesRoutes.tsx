import { Router } from "express";
import { addFavourite,removeFavourites,getMyFavourites } from "../controllers/favouriteController";
import { requiresLogin } from "../middleware/authMiddleware";

const favourite_router=Router()

favourite_router.get("/",requiresLogin,getMyFavourites)
favourite_router.post("/",requiresLogin,addFavourite)
favourite_router.delete("/:hotelId",requiresLogin,removeFavourites)

export default favourite_router