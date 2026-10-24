import { Router } from "express";
import { createBooking,getMyBookings,getBookingById,getAllBookings,updateBookingStatus,updateBooking } from "../controllers/bookingController";
import { requiresLogin,requiresAdmin } from "../middleware/authMiddleware";

const booking_router=Router()

//for logged in users
booking_router.post("/",requiresLogin,createBooking)
booking_router.get("/myBookings",requiresLogin,getMyBookings)

//admin routes 
booking_router.get("/",requiresLogin,requiresAdmin,getAllBookings)
booking_router.put("/:id/status",requiresLogin,requiresAdmin,updateBookingStatus)
booking_router.put("/:id",requiresLogin,requiresAdmin,updateBooking)

//user booking
booking_router.get("/:id",requiresLogin,getBookingById)

export default booking_router