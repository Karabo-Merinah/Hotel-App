import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { testConnection } from "./config/database"
import auth_router from "./routes/authRoutes"
import hotel_router from "./routes/hotelRoutes"
import room_router from "./routes/roomRoutes"
import booking_router from "./routes/bookingRoutes"

dotenv.config()

const app=express()
const port=process.env.PORT || 5000 

app.use(cors())
app.use(express.json())

app.use("/api/auth",auth_router)
app.use("/api/hotels",hotel_router)
app.use("/api/rooms",room_router)
app.use("/bookings",booking_router)

app.listen(port,async()=>{
    console.log("Server running on http://localhost:"+port)
    await testConnection()
})