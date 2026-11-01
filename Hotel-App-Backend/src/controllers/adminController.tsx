
import { Request, Response } from "express"
import connectionPool from "../config/database"

// Get statistics for the admin dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Count all hotels
        const hotels = await connectionPool.query("SELECT COUNT(*) FROM hotels")

        // Count active reservations
        const bookings = await connectionPool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")

        // Count available rooms
        const rooms = await connectionPool.query("SELECT SUM(total_rooms) FROM rooms WHERE is_active = TRUE")

        // Get monthly revenue
        const revenue = await connectionPool.query(`SELECT SUM(amount) FROM payments WHERE status = 'success'
     AND created_at >= DATE_TRUNC('month', CURRENT_DATE) AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`
        )

        // Get recent reservations
        const recentBookings = await connectionPool.query(`SELECT id, user_id, room_id, check_in, check_out, status FROM bookings
             ORDER BY id DESC LIMIT 5` )

        return res.status(200).json({
            total_hotels: parseInt(hotels.rows[0].count),
            active_bookings: parseInt(bookings.rows[0].count),
            available_rooms: parseInt(rooms.rows[0].sum || "0"),
            monthly_revenue: parseFloat(revenue.rows[0].sum || "0"),
            recent_bookings: recentBookings.rows
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to load dashboard statistics." })
    }
}
