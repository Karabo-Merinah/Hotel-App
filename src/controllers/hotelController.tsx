import { Request, Response } from "express"
import connectionPool from "../config/database"


//gets all hotels with the lowest room price .
export const getAllHotels = async (req: Request, res: Response) => {

    try {

        const result = await connectionPool.query(
            `SELECT id,name,city,address,star_rating,latitude,longitude,
            (SELECT MIN(price_per_night) FROM rooms 
            WHERE rooms.hotel_id=hotels.id AND  is_active=TRUE) AS price_from,
            (SELECT image_url FROM hotel_images WHERE hotel_images.hotel_id =hotels.id ORDER BY id LIMIT 1) AS main_image FROM hotels ORDER BY name)`
        )
        return res.status(200).json(result.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get hotels." })
    }
}

//get a hotel with its photos ,amenties and rooms.

export const getHotelById = async (req: Request, res: Response) => {

    try {
        const hotel_id = Number(req.params.id)

        //Checks if the id is a number 
        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })

        }

        //gets the hotel

        const hotel_results = await connectionPool.query(
            "SELECT * FROM hotels WHERE id=$1", [hotel_id]
        )

        if (hotel_results.rows.length === 0) {
            return res.status(404).json({ message: 'No hotel exists with this id ' })
        }

        //gets photos of the hotel 

        const hotel_image = await connectionPool.query(
            "SELECT id,image_url FROM hotel_images WHERE hotel_id=$1 ORDER BY ID", [hotel_id]
        )

        //gets hotel amenties 
        const hotel_amenties = await connectionPool.query(
            "SELECT id,name FROM amenties WHERE id IN (SELECT amenity_id FROM hotel_amenities WHERE hotel_id=$1) ORDER BY name", [hotel_id]
        )

        //gets the hotel rooms 

        const hotel_rooms = await connectionPool.query(
            "SELECT id,room_type,description,capacity,price_per_night FROM rooms WHERE hotel_id=$1 AND is_active=TRUE ORDER BY price_per_night", [hotel_id]
        )

        //get the room,amenties and images 
        const hotel = hotel_results.rows[0]
        hotel.images = hotel_image.rows
        hotel.amenities = hotel_amenties.rows
        hotel.rooms = hotel_rooms.rows

        return res.status(200).json(hotel)

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Couldn't get the hotel" })
    }
}



