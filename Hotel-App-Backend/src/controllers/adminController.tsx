import { Request, Response } from "express"
import connectionPool from "../config/database"

// Get statistics for the admin dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Count all hotels in the database
        const hotels = await connectionPool.query("SELECT COUNT(*) FROM hotels")

        // Count all confirmed reservations
        const bookings = await connectionPool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")

        // Count available rooms today in active hotels
        const rooms = await connectionPool.query(`
    SELECT SUM( GREATEST(rooms.total_rooms - COALESCE((SELECT SUM(bookings.number_of_rooms)
                FROM bookings WHERE bookings.room_id = rooms.id
                AND bookings.status IN ('pending', 'confirmed') AND bookings.check_in <= CURRENT_DATE
                AND bookings.check_out > CURRENT_DATE), 0),
            0)) AS available_rooms
    FROM rooms WHERE rooms.is_active = TRUE
    AND rooms.hotel_id IN (SELECT id FROM hotels WHERE is_active = TRUE)
`)
        // Calculate total revenue from paid bookings for the current month
        const revenue = await connectionPool.query(`SELECT SUM(amount) FROM payments WHERE status = 'paid'
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE) AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' `)

        // Get the five most recently created reservations
        const recentBookings = await connectionPool.query(`SELECT id, user_id, room_id, check_in, check_out, status FROM bookings
             ORDER BY id DESC LIMIT 5`)

        // Return all dashboard statistics to the frontend
        return res.status(200).json({
            total_hotels: parseInt(hotels.rows[0].count),
            active_bookings: parseInt(bookings.rows[0].count),
            available_rooms: parseInt(rooms.rows[0].available_rooms || "0"),
            monthly_revenue: parseFloat(revenue.rows[0].sum || "0"),
            recent_bookings: recentBookings.rows
        })

    } catch (error) {
        // Handle errors when loading dashboard statistics
        console.log(error)
        return res.status(500).json({ message: "Failed to load dashboard statistics." })
    }
}

// Get all reservations for the admin
export const getAllAdminBookings = async (req: Request, res: Response) => {
    try {
        // Get reservations together with guest, room and hotel information
        const result = await connectionPool.query(`SELECT bookings.*, users.name AS guest_name, users.email AS guest_email,
                    rooms.room_type, hotels.name AS hotel_name
             FROM bookings, users, rooms, hotels WHERE bookings.user_id = users.id
             AND bookings.room_id = rooms.id AND rooms.hotel_id = hotels.id
             ORDER BY bookings.id DESC`
        )

        // Return all reservations, starting with the newest
        return res.status(200).json(result.rows)

    } catch (error) {
        // Handle errors when retrieving reservations
        console.log(error)
        return res.status(500).json({ message: "Could not load reservations." })
    }
}

// Get the details of a specific reservation
export const getAdminBookingById = async (req: Request, res: Response) => {
    try {
        // Get the reservation ID from the URL
        const id = parseInt(req.params.id as string)

        // Find the reservation and include guest, room and hotel details
        const result = await connectionPool.query(`SELECT bookings.*, users.name AS guest_name,users.email AS guest_email,
                    rooms.room_type,hotels.name AS hotel_name
             FROM bookings, users, rooms, hotels  WHERE bookings.user_id = users.id
             AND bookings.room_id = rooms.id AND rooms.hotel_id = hotels.id AND bookings.id = $1`,
            [id]
        )

        // Return an error if the reservation does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Reservation not found." })
        }
        // Return the selected reservation details
        return res.status(200).json(result.rows[0])

    } catch (error) {
        // Handle errors when retrieving reservation details
        console.log(error)
        return res.status(500).json({ message: "Could not load reservation details." })
    }
}
