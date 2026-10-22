
import { Request, Response } from "express"
import connectionPool from "../config/database"


//get all active rooms belonging to a hotel
export const getHotelRooms = async (req: Request, res: Response) => {
    try {
        const hotel_id = Number(req.params.hotelId)

        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })
        }

        const result = await connectionPool.query(
            "SELECT * FROM rooms WHERE hotel_id=$1 AND is_active=TRUE ORDER BY price_per_night", [hotel_id])
        return res.status(200).json(result.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get hotel rooms." })
    }
}


//get a room by its id
export const getRoomById = async (req: Request, res: Response) => {
    try {
        const room_id = Number(req.params.id)

        if (isNaN(room_id)) {
            return res.status(400).json({ message: "Room id must be a number." })
        }

        const result = await connectionPool.query(
            "SELECT * FROM rooms WHERE id=$1 AND is_active=TRUE",
            [room_id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found." })
        }

        return res.status(200).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get room." })
    }
}


//check room details sent by admin
const getRoomDataErrors = (roomData: any) => {

    if (!roomData.hotel_id || !roomData.room_type) {
        return "Hotel id and room type are required."
    }

    const capacity = Number(roomData.capacity)
    const price = Number(roomData.price_per_night)
    const totalRooms = Number(roomData.total_rooms)

    if (roomData.capacity == null || isNaN(capacity) || capacity <= 0 || !Number.isInteger(capacity)) {
        return "Capacity must be a positive whole number."
    }

    if (roomData.price_per_night == null || isNaN(price) || price < 0) {
        return "Price must be zero or greater."
    }

    if (roomData.total_rooms == null || isNaN(totalRooms) || totalRooms < 0 || !Number.isInteger(totalRooms)) {
        return "Total rooms must be a whole number."
    }

    return ""
}


//create a room
export const createRoom = async (req: Request, res: Response) => {
    try {
        const roomData = req.body
        const errorMessage = getRoomDataErrors(roomData)

        if (errorMessage !== "") {
            return res.status(400).json({ message: errorMessage })
        }

        const hotel = await connectionPool.query("SELECT id FROM hotels WHERE id=$1", [roomData.hotel_id])

        if (hotel.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }

        const result = await connectionPool.query(
            `INSERT INTO rooms(hotel_id,room_type,description,capacity,price_per_night,total_rooms) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [
                roomData.hotel_id,
                roomData.room_type,
                roomData.description,
                roomData.capacity,
                roomData.price_per_night,
                roomData.total_rooms
            ]
        )
        return res.status(201).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not create room." })
    }
}


//update room information
export const updateRoom = async (req: Request, res: Response) => {
    try {
        const room_id = Number(req.params.id)

        if (isNaN(room_id)) {
            return res.status(400).json({ message: "Room id must be a number." })
        }

        const roomData = req.body
        const errorMessage = getRoomDataErrors(roomData)

        if (errorMessage !== "") {
            return res.status(400).json({ message: errorMessage })
        }

        const result = await connectionPool.query(
            `UPDATE rooms SET hotel_id=$1,room_type=$2,description=$3, capacity=$4,price_per_night=$5,total_rooms=$6,is_active=$7,updated_at=NOW()WHERE id=$8 RETURNING *`,
            [
                roomData.hotel_id,
                roomData.room_type.trim(),
                roomData.description,
                parseInt(roomData.capacity),
                parseInt(roomData.price_per_night),
                parseInt(roomData.total_rooms),
                roomData.is_active,
                room_id
            ]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found." })
        }

        return res.status(200).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not update room." })
    }
}


//delete a room
export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const room_id = Number(req.params.id)

        if (isNaN(room_id)) {
            return res.status(400).json({ message: "Room id must be a number." })
        }

        const result = await connectionPool.query(
            "DELETE FROM rooms WHERE id=$1 RETURNING id",
            [room_id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found." })
        }

        return res.status(200).json({ message: "Room deleted successfully." })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Could not delete room. It may have existing bookings."
        })
    }
}
