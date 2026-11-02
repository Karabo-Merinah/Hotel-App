import { Request, Response } from "express";
import connectionPool from "../config/database";
import cloudinary from "../config/cloudinary"

//get full list of amenties 

export const getAllAmenties = async (req: Request, res: Response) => {
    try {
        const result = await connectionPool.query("SELECT id,name FROM amenities  ORDER BY name")
        return res.status(200).json(result.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could  not get the amenities." })
    }
}

// Upload hotel image
export const addHotelImage = async (req: Request, res: Response) => {
    try {
        const hotel_id = parseInt(req.params.id as string)
        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })
        }
        if (!req.file) {
            return res.status(400).json({ message: "Please select an image." })
        }
        const hotel = await connectionPool.query(
            "SELECT id FROM hotels WHERE id=$1 AND is_active=TRUE",
            [hotel_id]
        )
        if (hotel.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }
        const image = await new Promise<{ image_url: string, public_id: string }>((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: "wander-inn/hotels" },
                (error, result) => {
                    if (error) {
                        reject(error)
                    } else if (result) {
                        resolve({image_url: result.secure_url,public_id: result.public_id })
                    } else {
                        reject(new Error("Image upload failed."))
                    }
                }
            )
            upload.end(req.file!.buffer)
        })
        const result = await connectionPool.query(`INSERT INTO hotel_images(hotel_id, image_url,public_id)  VALUES ($1, $2,$3) RETURNING *`,
            [hotel_id, image.image_url, image.public_id]
        )
        return res.status(201).json({ message: "Hotel image uploaded successfully.", image: result.rows[0] })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not upload hotel image." })
    }
}

export const deleteHotelImage = async (req: Request, res: Response) => {
    try {
        const image_id = parseInt(req.params.imageId as string)

        if (isNaN(image_id) || image_id <= 0) {
            return res.status(400).json({ message: "Invalid image id." })
        }
        const result = await connectionPool.query("SELECT * FROM hotel_images WHERE id=$1",
            [image_id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Photo not found." })
        }
        const public_id = result.rows[0].public_id
        if (!public_id) {
            return res.status(400).json({message: "This image has no Cloudinary public ID." })
        }
        const deleted = await cloudinary.uploader.destroy(public_id)
        if (deleted.result !== "ok" && deleted.result !== "not found") {
            return res.status(500).json({ message: "Could not delete image from Cloudinary." })
        }
        await connectionPool.query("DELETE FROM hotel_images WHERE id=$1", [image_id]
        )
        return res.status(200).json({ message: "Photo deleted successfully." })
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