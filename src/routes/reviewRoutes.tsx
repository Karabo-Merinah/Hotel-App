import { Router } from "express";
import { createReview, getHotelReviews } from "../controllers/reviewController";
import { requiresLogin } from "../middleware/authMiddleware";

const review_router = Router()

//anyone can read the reviews 
review_router.get("/hotel/:hotelId", getHotelReviews)

//only logged in users can write review
review_router.post("/", requiresLogin, createReview)

export default review_router