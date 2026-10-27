
import { Request, Response } from "express"
import connectionPool from "../config/database"


//get all active rooms belonging to a hotel
export const getHotelRooms = async (req: Request, res: Response) => {
    try {
        const hotel_id = Number(req.params.hotelId)

        if (!Number.isInteger(hotel_id) || hotel_id <= 0) {
            return res.status(400).json({ message: "Hotel id must be a positive number." })
        }

        const result = await connectionPool.query(
            `SELECT rooms.* FROM rooms, hotels
        WHERE rooms.hotel_id = hotels.id AND rooms.hotel_id = $1
        AND rooms.is_active = TRUE AND hotels.is_active = TRUE
        ORDER BY rooms.price_per_night;`, [hotel_id])
        return res.status(200).json(result.rows)

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Could not get hotel rooms." })
    }
};

//get a room by its id with the pictures
export const getRoomById = async (req: Request, res: Response) => {

    try {
        const room_id = Number(req.params.id);

        if (!Number.isInteger(room_id) || room_id <= 0) {
            return res.status(400).json({
                message: "Room id must be a positive number."
            })
        }

        // Get room information
        const result = await connectionPool.query(
            `SELECT rooms.* FROM rooms, hotels WHERE rooms.hotel_id = hotels.id
            AND rooms.id = $1 AND rooms.is_active = TRUE  AND hotels.is_active = TRUE;`, [room_id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found."})
        }

        // Get pictures belonging to this room
        const images = await connectionPool.query(
            `SELECT id, image_url FROM room_images WHERE room_id = $1 ORDER BY id`, [room_id])

        return res.status(200).json({...result.rows[0], images: images.rows})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get room details." })
    }
}

//check room details sent by admin and handles the errors.
const getRoomDataErrors = (roomData: any) => {

    //checks if the room's id and room type is not empty 
    if (!Number.isInteger(Number(roomData.hotel_id)) || Number(roomData.hotel_id) <= 0 || typeof roomData.room_type !== "string" || roomData.room_type.trim() === "") {
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
                roomData.room_type.trim(),
                roomData.description,
                parseInt(roomData.capacity),
                Number(roomData.price_per_night),
                parseInt(roomData.total_rooms)
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
        //if the admin doesn't send is_active then room keeps it's current value 
        let isActive: boolean | null = null
        if (roomData.is_active === true || roomData.is_active === false) {
            isActive = roomData.is_active
        }
        const hotel = await connectionPool.query("SELECT id FROM hotels WHERE id=$1", [roomData.hotel_id])

        if (hotel.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }

        const result = await connectionPool.query(
            `UPDATE rooms SET hotel_id=$1,room_type=$2,description=$3, capacity=$4,price_per_night=$5,total_rooms=$6,is_active=COALESCE($7,is_active) WHERE id=$8 RETURNING *`,
            [
                roomData.hotel_id,
                roomData.room_type.trim(),
                roomData.description,
                parseInt(roomData.capacity),
                Number(roomData.price_per_night),
                parseInt(roomData.total_rooms),
                isActive,
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
        return res.status(500).json({ message: "Could not delete room." })
    }
}
