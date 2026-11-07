import { Request, Response } from "express"
import connectionPool from "../config/database"

//gets all hotels with the lowest room price and the photo .

export const getAllHotels = async (req: Request, res: Response) => {
    try {
        const values: (string | number)[] = []
        let room_filters = " AND rooms.is_active=TRUE AND rooms.total_rooms>0"

        let query_text = `SELECT id,name,description,city,address,star_rating,latitude,longitude,
        (SELECT image_url FROM hotel_images WHERE hotel_id=hotels.id ORDER BY id LIMIT 1) AS main_image
        FROM hotels WHERE hotels.is_active=TRUE`

        // Filter by location
        if (req.query.city) {
            values.push("%" + String(req.query.city).trim() + "%")
            query_text += ` AND (LOWER(city) LIKE LOWER($${values.length}) OR LOWER(address) LIKE LOWER($${values.length}))`
        }

        // Filter by star rating
        if (req.query.stars) {
            const stars = parseInt(String(req.query.stars))

            if (isNaN(stars) || String(stars) !== String(req.query.stars) || stars < 1 || stars > 5) {
                return res.status(400).json({ message: "Star rating must be between 1 and 5." })
            }

            values.push(stars)
            query_text += ` AND star_rating >= $${values.length}`
        }

        // Filter by minimum price
        if (req.query.minPrice) {
            const minPrice = Number(req.query.minPrice)

            if (isNaN(minPrice) || minPrice < 0) {
                return res.status(400).json({ message: "Minimum price must be zero or greater." })
            }

            values.push(minPrice)
            room_filters += ` AND rooms.price_per_night >= $${values.length}`
        }

        // Filter by maximum price
        if (req.query.maxPrice) {
            const maxPrice = Number(req.query.maxPrice)
            if (isNaN(maxPrice) || maxPrice < 0) {
                return res.status(400).json({ message: "Maximum price must be zero or greater." })
            }
            values.push(maxPrice)
            room_filters += ` AND rooms.price_per_night <= $${values.length}`
        }

        // Validate price range
        if (req.query.minPrice && req.query.maxPrice) {
            if (Number(req.query.minPrice) > Number(req.query.maxPrice)) {
                return res.status(400).json({ message: "Minimum price cannot exceed maximum price." })
            }
        }

        // Filter by number of guests
        if (req.query.guests) {
            const guests = parseInt(String(req.query.guests))

            if (isNaN(guests) || String(guests) !== String(req.query.guests) || guests < 1) {
                return res.status(400).json({ message: "Guests must be a positive whole number." })
            }

            values.push(guests)
            room_filters += ` AND rooms.capacity >= $${values.length}`
        }

        // Filter by amenities
        if (req.query.amenities) {
            const amenities = String(req.query.amenities).split(",").map(name => name.trim()).filter(name => name !== "")

            for (const amenity of amenities) {
                values.push(amenity)
                query_text += ` AND hotels.id IN (SELECT hotel_id FROM hotel_amenities WHERE amenity_id IN (SELECT id FROM amenities WHERE LOWER(name)=LOWER($${values.length})))`
            }
        }

        // Validate number of rooms
        const number_of_rooms = req.query.number_of_rooms ? parseInt(String(req.query.number_of_rooms)) : 1

        if (isNaN(number_of_rooms) || number_of_rooms < 1 || (req.query.number_of_rooms && String(number_of_rooms) !== String(req.query.number_of_rooms))) {
            return res.status(400).json({ message: "Number of rooms must be a positive whole number." })
        }

        values.push(number_of_rooms)
        room_filters += ` AND rooms.total_rooms >= $${values.length}`
        const rooms_index = values.length

        // Filter by check-in and check-out dates
        const check_in = String(req.query.check_in || "")
        const check_out = String(req.query.check_out || "")

        if (check_in || check_out) {
            if (!check_in || !check_out) {
                return res.status(400).json({ message: "Both check-in and check-out dates are required." })
            }
            if (isNaN(Date.parse(check_in)) || isNaN(Date.parse(check_out))) {
                return res.status(400).json({ message: "Invalid check-in or check-out date." })
            }
            if (new Date(check_out) <= new Date(check_in)) {
                return res.status(400).json({ message: "Check-out must be after check-in." })
            }

            values.push(check_in, check_out)
            const check_in_index = values.length - 1
            const check_out_index = values.length

            // Check available rooms for every night of the stay
            room_filters += ` AND NOT EXISTS ( SELECT 1 FROM generate_series($${check_in_index}::date, $${check_out_index}::date - 1, INTERVAL '1 day') AS stay_date
                WHERE (SELECT COALESCE(SUM(b.number_of_rooms),0) FROM bookings b
                WHERE b.room_id=rooms.id AND b.status IN ('pending','confirmed')
                AND b.check_in<=stay_date AND b.check_out>stay_date)
                > rooms.total_rooms - $${rooms_index} )`
        }
        // Return hotels with matching rooms and their lowest matching price
        query_text = query_text.replace("FROM hotels WHERE", `, (SELECT MIN(rooms.price_per_night) FROM rooms WHERE rooms.hotel_id=hotels.id${room_filters}) AS price_from
            FROM hotels WHERE`
        )
        query_text += ` AND hotels.id IN (SELECT rooms.hotel_id FROM rooms WHERE rooms.hotel_id=hotels.id${room_filters}) ORDER BY name`
        const result = await connectionPool.query(query_text, values)
        return res.status(200).json(result.rows)
    } catch (error) {
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
            "SELECT * FROM hotels WHERE id=$1 AND is_active=TRUE ", [hotel_id]
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

        //gets the hotel rooms guests can book 

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

//checks the hotel details  sent by admin  by handling possible errors.
const getHotelDataErrors = (hotelData: any) => {
    //checks if the hotel name,address,city are not empty . 
    if (!hotelData.name || !hotelData.address || !hotelData.city) {
        return "Name,address and city are required."
    }
    const latitude = parseFloat(hotelData.latitude)
    const longitude = parseFloat(hotelData.longitude)

    //checks if the map coordinates are provided and their scale 

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
            hotelData.name.trim(),
            hotelData.description,
            hotelData.address.trim(),
            hotelData.city.trim(),
            parseFloat(hotelData.latitude),
            parseFloat(hotelData.longitude),
            parseInt(hotelData.star_rating),
            hotelData.policies,
            hotel_id
        ]
        )
        //if no row is returned there's no hotel with that id.
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
        //A hotel that already has bookings can't be deleted.
        // guests no longer see it
        const has_bookings = await connectionPool.query(
            "SELECT 1 FROM bookings WHERE room_id IN (SELECT id FROM rooms WHERE hotel_id=$1) LIMIT 1", [hotel_id]
        )
        if (has_bookings.rows.length > 0) {
            const hidden = await connectionPool.query(
                "UPDATE hotels SET is_active=FALSE WHERE id=$1 RETURNING id", [hotel_id]
            )
            if (hidden.rows.length === 0) {
                return res.status(404).json({ message: "Hotel not found." })
            }
            return res.status(200).json({ message: "This hotel has bookings, so it was hidden (deactivated) instead of deleted." })
        }
        const result = await connectionPool.query(
            "DELETE FROM hotels WHERE id=$1 RETURNING id", [hotel_id]
        )
        //no hotel deleted it means there's no hotel with that id .
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
