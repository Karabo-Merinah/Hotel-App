import { Request, Response } from "express";
import connectionPool from "../config/database";

// adding a hotel to the favourites as a logged in user 
export const addFavourite = async (req: Request, res: Response) => {
    try {
        //gets user id from middleware 

        const user_id = res.locals.userId
        //get hotel id 
        const hotel_id = Number(req.body.hotel_id)

        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number" })
        }

        //checks if hotel exists using id 
        const hotel_results = await connectionPool.query(
            "SELECT id FROM hotels WHERE id=$1", [hotel_id]
        )
        if (hotel_results.rows.length === 0) {
            return res.status(404).json({ message: "Hotel doesn't exist." })
        }
        //ensures it is first time hotel is marked as favourite 
        const existing = await connectionPool.query(
            "SELECT hotel_id FROM favourites WHERE user_id=$1 AND hotel_id=$2", [user_id, hotel_id]
        )
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "This hotel is already in your favourites " })
        }
        await connectionPool.query(
            "INSERT INTO favourites (user_id,hotel_id) VALUES($1,$2)", [user_id, hotel_id]
        )
        return res.status(201).json({ message: "Hotel added to your favourites." })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not add hotel to favourites." })
    }
}

//remove hotel from the favourites 
export const removeFavourites = async (req: Request, res: Response) => {
    try {
        const user_id = res.locals.userId
        const hotel_id = Number(req.params.hotelId)

        //checks if the hotel id is a number 
        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number" })
        }

        const result = await connectionPool.query(
            "DELETE FROM favourites WHERE user_id=$1 AND hotel_id=$2 RETURNING hotel_id", [user_id, hotel_id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "This hotel is not in your favourites." })
        }
        return res.status(200).json({ message: "Hotel has successfully been removed from your favourites." })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not remove the favourite." })
    }
}


//get logged in user favourites 

export const getMyFavourites = async (req:Request,res: Response) => {
    try {
        const user_id = res.locals.userId

        const results = await connectionPool.query(
            `SELECT id,name,city,address,star_rating,latitude,longitude,
            (SELECT MIN(price_per_night) FROM rooms  WHERE rooms.hotel_id=hotels.id AND is_active=TRUE) AS price_from,
            (SELECT image_url FROM hotel_images WHERE hotel_images.hotel_id=hotels.id  ORDER BY id LIMIT 1 ) as main_image FROM hotels
            WHERE id IN (SELECT hotel_id FROM favourites WHERE user_id=$1) ORDER BY name`, [user_id]
        )
        return res.status(200).json(results.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get your favourites." })
    }
}