import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { testConnection } from "./config/database"
import auth_router from "./routes/authRoutes"
import hotel_router from "./routes/hotelRoutes"
import room_router from "./routes/roomRoutes"
import booking_router from "./routes/bookingRoutes"
import user_router from "./routes/userRoutes"
import favourite_router from "./routes/favouritesRoutes"
import review_router from "./routes/reviewRoutes"
import notification_router from "./routes/notificationRoutes"
import payment_router from "./routes/paymentRoutes"
import admin_router from "./routes/adminRoutes"

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin: ["http://localhost:5173",
        "https://wander-hotel-app.netlify.app"
    ]
}))

app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({ message: "Wander Inn API is running" })
})

app.use("/api/auth", auth_router)
app.use("/api/hotels", hotel_router)
app.use("/api/rooms", room_router)
app.use("/api/bookings", booking_router)
app.use("/api/users", user_router)
app.use("/api/favourites", favourite_router)
app.use("/api/reviews", review_router)
app.use("/api/notifications",notification_router)
app.use("/api/payments",payment_router)
app.use("/api/admin",admin_router)


app.listen(port, async () => {
    console.log("Server running on port " + port)
    await testConnection()
})