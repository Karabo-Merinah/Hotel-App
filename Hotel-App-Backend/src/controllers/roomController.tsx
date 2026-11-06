import { Request, Response } from "express"
import connectionPool from "../config/database"
import cloudinary from "../config/cloudinary"

// Get rooms belonging to a hotel

export const getHotelRooms = async (req: Request, res: Response) => {
    try {
        const hotel_id = parseInt(req.params.hotelId as string)
        const checkIn = String(req.query.checkIn || "")
        const checkOut = String(req.query.checkOut || "")

        if (isNaN(hotel_id) || hotel_id <= 0) {
            return res.status(400).json({ message: "Invalid hotel id." })
        }

        // When users are browsing hotels without selecting dates
        if (!checkIn && !checkOut) {
            const result = await connectionPool.query(`SELECT rooms.* FROM rooms, hotels WHERE rooms.hotel_id = hotels.id
                AND rooms.hotel_id = $1 AND rooms.is_active = TRUE
                AND hotels.is_active = TRUE ORDER BY rooms.price_per_night`,
                [hotel_id])
            return res.status(200).json(result.rows)
        }
        // When users search for available rooms
        const guests = parseInt(String(req.query.guests))
        const numberOfRooms = parseInt(String(req.query.numberOfRooms))

        if (isNaN(guests) || guests < 1 || isNaN(numberOfRooms) || numberOfRooms < 1) {
            return res.status(400).json({ message: "Enter valid guests and rooms." })
        }

        if (!checkIn || !checkOut || isNaN(Date.parse(checkIn)) ||
            isNaN(Date.parse(checkOut)) || checkOut <= checkIn ||
            checkIn < new Date().toISOString().slice(0, 10)) {
            return res.status(400).json({ message: "Enter valid booking dates." })
        }

        const result = await connectionPool.query(`SELECT rooms.* FROM rooms, hotels WHERE rooms.hotel_id = hotels.id
            AND rooms.hotel_id = $1 AND rooms.is_active = TRUE AND hotels.is_active = TRUE
            AND rooms.capacity * $2 >= $3 AND rooms.capacity <= $3
            AND rooms.total_rooms - ( SELECT COALESCE(SUM(number_of_rooms), 0)  FROM bookings
                WHERE bookings.room_id = rooms.id AND bookings.status IN ('pending', 'confirmed')
                AND bookings.check_in < $5  AND bookings.check_out > $4) >= $2  ORDER BY rooms.price_per_night`,
            [hotel_id, numberOfRooms, guests, checkIn, checkOut]
        )

        return res.status(200).json(result.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get hotel rooms." })
    }
}

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
            return res.status(404).json({ message: "Room not found." })
        }

        // Get pictures belonging to this room
        const images = await connectionPool.query(
            `SELECT id, image_url FROM room_images WHERE room_id = $1 ORDER BY id`, [room_id])

        return res.status(200).json({ ...result.rows[0], images: images.rows })

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
        //A room that has bookings can't be deleted  so it is set to not active.
        const has_bookings = await connectionPool.query("SELECT 1 FROM bookings WHERE room_id=$1 LIMIT 1", [room_id])
        if (has_bookings.rows.length > 0) {
            const hidden = await connectionPool.query("UPDATE rooms SET is_active=FALSE WHERE id=$1 RETURNING id", [room_id])
            if (hidden.rows.length === 0) {
                return res.status(404).json({ message: "Room not found." })
            }
            return res.status(200).json({ message: "This room has bookings, so it is deactivated instead of deleted." })
        }
        const result = await connectionPool.query("DELETE FROM rooms WHERE id=$1 RETURNING id", [room_id])
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
// Admin uploads a room image
export const addRoomImage = async (req: Request, res: Response) => {
    try {
        const room_id = parseInt(req.params.id as string)
        if (isNaN(room_id) || room_id <= 0) {
            return res.status(400).json({ message: "Invalid room id." })
        }
        if (!req.file) {
            return res.status(400).json({ message: "Please select an image." })
        }
        const room = await connectionPool.query("SELECT id FROM rooms WHERE id=$1 AND is_active=TRUE",
            [room_id]
        )
        if (room.rows.length === 0) {
            return res.status(404).json({ message: "Room not found." })
        }
        const image = await new Promise<{ image_url: string, public_id: string }>((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: "wander-inn/rooms" },
                (error, result) => {
                    if (error) {
                        reject(error)
                    }
                    else if (result) {
                        resolve({
                            image_url: result.secure_url, public_id: result.public_id
                        })
                    }
                    else {
                        reject(new Error("Image upload failed."))
                    }
                }
            )
            upload.end(req.file!.buffer)
        })
        const result = await connectionPool.query(`INSERT INTO room_images (room_id, image_url, public_id) VALUES ($1, $2, $3) RETURNING *`,
            [room_id, image.image_url, image.public_id]
        )
        return res.status(201).json({
            message: "Room image uploaded successfully.", image: result.rows[0]
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not upload room image." })
    }
}

// Admin deletes a room picture
export const deleteRoomImage = async (req: Request, res: Response) => {
    try {
        const image_id = parseInt(req.params.imageId as string)
        if (isNaN(image_id) || image_id <= 0) {
            return res.status(400).json({ message: "Invalid image id." })
        }
        const result = await connectionPool.query("SELECT * FROM room_images WHERE id=$1", [image_id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Picture not found." })
        }
        const public_id = result.rows[0].public_id
        if (!public_id) {
            return res.status(400).json({ message: "This image has no Cloudinary public ID." })
        }
        const deleted = await cloudinary.uploader.destroy(public_id)
        if (deleted.result !== "ok" && deleted.result !== "not found") {
            return res.status(500).json({ message: "Could not delete image from Cloudinary." })
        }
        await connectionPool.query("DELETE FROM room_images WHERE id=$1", [image_id]
        )
        return res.status(200).json({ message: "Room picture deleted successfully." })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not delete the room picture." })
    }
}