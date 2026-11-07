
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

export const getAllAdminBookings = async (req: Request, res: Response) => {
    try {
        const result = await connectionPool.query(`SELECT bookings.*, users.name AS guest_name, users.email AS guest_email,
                    rooms.room_type, hotels.name AS hotel_name
             FROM bookings, users, rooms, hotels WHERE bookings.user_id = users.id
             AND bookings.room_id = rooms.id AND rooms.hotel_id = hotels.id
             ORDER BY bookings.id DESC`
        )
        return res.status(200).json(result.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not load reservations." })
    }
}

export const getAdminBookingById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string)

        const result = await connectionPool.query(`SELECT bookings.*, users.name AS guest_name,users.email AS guest_email,
                    rooms.room_type,hotels.name AS hotel_name
             FROM bookings, users, rooms, hotels  WHERE bookings.user_id = users.id
             AND bookings.room_id = rooms.id AND rooms.hotel_id = hotels.id AND bookings.id = $1`,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Reservation not found." })
        }
        return res.status(200).json(result.rows[0])
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not load reservation details." })
    }
}

export const updateAdminBookingStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string)
        const { status } = req.body

        if (status !== "confirmed" && status !== "cancelled") {
            return res.status(400).json({ message: "Invalid reservation status." })
        }

        const result = await connectionPool.query(`UPDATE bookings SET status = $1 WHERE id = $2
        AND status = 'pending' AND ($1 = 'cancelled'OR id IN (SELECT booking_id FROM payments WHERE status = 'paid') )RETURNING *`,
            [status, id]
        )
        if (result.rows.length === 0) {
            return res.status(409).json({ message: "Reservation not found or no longer pending." })
        }

        return res.status(200).json({ message: "Reservation updated successfully.", booking: result.rows[0] })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not update reservation." })
    }
}
