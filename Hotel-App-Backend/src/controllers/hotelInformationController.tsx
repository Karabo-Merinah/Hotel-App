import { Request, Response } from "express";
import connectionPool from "../config/database";

//get full list of amenties 

export const getAllAmenties = async (req: Request, res: Response) => {
    try {
        const result = await connectionPool.query(
            "SELECT id,name FROM amenities  ORDER BY name")
        return res.status(200).json(result.rows)

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could  not get the amenities." })
    }
}

//add a photo to a hotel 
export const addHotelImage = async (req: Request, res: Response) => {
    try {
        const hotel_id = Number(req.params.id)

        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })
        }

        if (!req.body.image_url) {
            return res.status(400).json({ message: "Image link is required." })
        }
        const image_url = String(req.body.image_url).trim()

        //like must start with http and have maximum of 255 characters 

        if (!image_url.startsWith("http") || image_url.length > 255) {
            return res.status(400).json({ message: "Image link must start with http and be maximum of 255 characters." })
        }

        const hotel_result = await connectionPool.query(
            "SELECT id FROM hotels WHERE id=$1", [hotel_id]
        )
        if (hotel_result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }
        const result = await connectionPool.query(
            "INSERT INTO hotel_images (hotel_id,image_url) VALUES($1,$2) RETURNING id,hotel_id,image_url",
            [hotel_id, image_url]
        )
        return res.status(201).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not add the photo." })
    }
}

//delete a photo .

export const deleteHotelImage = async (req: Request, res: Response) => {
    try {
        const image_id = Number(req.params.imageId)

        if (isNaN(image_id)) {
            return res.status(400).json({ message: "Image id must be a number." })
        }

        const result = await connectionPool.query(
            "DELETE FROM hotel_images WHERE id=$1 RETURNING id", [image_id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Photo not found." })
        }
        return res.status(200).json({ message: "Photo deleted." })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not delete the photo." })
    }
}

//sets  the amenties of a hotel 

export const setHotelAmenities = async (req: Request, res: Response) => {
    try {
        const hotel_id = Number(req.params.id)
        const amenity_ids = req.body.amenity_ids

        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })
        }
        //list is sent and can be empty.
        if (!amenity_ids || amenity_ids.length === undefined) {
            return res.status(400).json({ message: 'amenity id must be a list ' })
        }

        const hotel_result = await connectionPool.query(
            "SELECT id FROM hotels WHERE id=$1", [hotel_id]
        )
        if (hotel_result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }

        //check every amenity id first so nothing changes if one is wrong 
        for (let i = 0; i < amenity_ids.length; i++) {
            const amenity_id = Number(amenity_ids[i])
            if (isNaN(amenity_id)) {
                return res.status(400).json({ message: "Every amenity id must be a  number." })
            }
            const amenity_result = await connectionPool.query(
                "SELECT id FROM amenities WHERE id=$1", [amenity_id]
            )
            if (amenity_result.rows.length === 0) {
                return res.status(404).json({ message: "Amenity number " + amenity_id + " does not  exists." })
            }
        }

        // remove the old list ,then add the new one.
        await connectionPool.query("DELETE FROM hotel_amenities  WHERE hotel_id=$1", [hotel_id])

        const added: number[] = []

        for (let i = 0; i < amenity_ids.length; i++) {

            const amenity_id = Number(amenity_ids[i])

            //skip id that was sent twice 
            if (added.includes(amenity_id)) {
                continue
            }
            await connectionPool.query(
                "INSERT INTO hotel_amenities (hotel_id,amenity_id) VALUES($1,$2)", [hotel_id, amenity_id]
            )
            added.push(amenity_id)
        }
        //send back the new list 
        const result = await connectionPool.query(
            "SELECT id,name FROM amenities WHERE id IN (SELECT amenity_id FROM hotel_amenities  WHERE hotel_id=$1) ORDER BY name",
            [hotel_id]
        )
        return res.status(200).json(result.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not update the amenities." })
    }
}