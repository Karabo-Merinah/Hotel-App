import { Request, Response } from "express"
import connectionPool from "../config/database"


//gets all hotels with the lowest room price .
export const getAllHotels = async (req: Request, res: Response) => {

    try {

        const result = await connectionPool.query(
            `SELECT id,name,city,address,star_rating,latitude,longitude,
            (SELECT MIN(price_per_night) FROM rooms 
            WHERE rooms.hotel_id=hotels.id AND  is_active=TRUE) AS price_from,
            (SELECT image_url FROM hotel_images WHERE hotel_images.hotel_id =hotels.id ORDER BY id LIMIT 1) AS main_image FROM hotels ORDER BY name`
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
            "SELECT id,name FROM amenities WHERE id IN (SELECT amenity_id FROM hotel_amenities WHERE hotel_id=$1) ORDER BY name", [hotel_id]
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

//checks the hotel details  sent by admin 
const getHotelDataErrors = (hotelData: any) => {
    if (!hotelData.name || !hotelData.address || !hotelData.city) {
        return "Name,address and city are required."
    }
    const latitude = parseFloat(hotelData.latitude)
    const longitude = parseFloat(hotelData.longitude)

    if (isNaN(latitude) || isNaN(longitude)) {
        return "Latitude and longitude are required and must be a number."
    }
    if (latitude < -90 || latitude > 90) {
        return "Latitude  must be between -90 and 90"
    }
    if (longitude < -180 || longitude > 180) {
        return "Longitude must be between -180 and 180"
    }

    const starRating = parseInt(hotelData.star_rating)

    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
        return "Star rating must be a number from 1 to 5."
    }
    return ""
}

//create hotel
export const createHotel = async (req: Request, res: Response) => {
    try {
        const hotelData = req.body
        const errorMessage = getHotelDataErrors(hotelData)

        if (errorMessage !== "") {
            return res.status(400).json({ message: errorMessage })
        }

        const result = await connectionPool.query(
            `INSERT INTO hotels(name,description,address,city,latitude,longitude,star_rating,policies)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [hotelData.name.trim(), hotelData.description, hotelData.address.trim(), hotelData.city.trim(), parseFloat(hotelData.latitude), parseFloat(hotelData.longitude), parseInt(hotelData.star_rating), hotelData.policies]
        )
        return res.status(201).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not create the hotel" })
    }
}

//update hotel's information 

export const updateHotel = async (req: Request, res: Response) => {
    try {
        const hotel_id = Number(req.params.id)

        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })
        }
        const hotelData = req.body
        const errorMessage = getHotelDataErrors(hotelData)

        if (errorMessage !== "") {
            return res.status(400).json({ message: errorMessage })
        }

        const result = await connectionPool.query(
            `UPDATE hotels SET name=$1,description=$2,address=$3,city=$4,latitude=$5,longitude=$6,star_rating=$7,policies=$8 WHERE id=$9 RETURNING *`, [
            hotelData.name,
            hotelData.description,
            hotelData.address,
            hotelData.city,
            parseFloat(hotelData.latitude),
            parseFloat(hotelData.longitude),
            parseInt(hotelData.star_rating),
            hotelData.policies,
            hotel_id
        ]
        )
        //if no row is returned 
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel is not found." })
        }
        return res.status(200).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not update the hotel." })
    }
}

//delete hotel 

export const deleteHotel = async (req: Request, res: Response) => {
    try {
        const hotel_id = Number(req.params.id)

        //checks if the hotel id is a numebr 
        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })
        }

        const result = await connectionPool.query(
            "DELETE FROM hotels WHERE id=$1 RETURNING id", [hotel_id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }
        return res.status(200).json({ message: "Hotel successfully deleted." })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not delete the hotel." })
    }
}


