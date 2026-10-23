import { Request, Response } from "express"
import connectionPool from "../config/database"

const select_booking = `SELECT id,user_id,room_id,TO_CHAR(check_in,'YYYY-MM-DD') AS check_in,
TO_CHAR(check_out,'YYYY-MM-DD') AS check_out,number_of_rooms,number_of_guest,total_price,status,created_at,
(SELECT name FROM users WHERE users.id=bookings.user_id) AS guest_name,
(SELECT email FROM users WHERE users.id=bookings.user_id) AS guest_email,
(SELEC room_type FROM rooms WHERE rooms.id=bookings.room_id) AS room_type,
(SELECT name FROM hotels WHERE hotels.id=(SELECT hotel_id FROM rooms WHERE rooms.id=bookings.room_id)) AS hotel_name
FROM bookings`

//checks the dates ,rooms and guest sent in booking.

const getBookingsErrors = (bookingData: any) => {

    //checks if the check in and check out  dates are filled in 
    if (!bookingData.check_in || !bookingData.check_out) {
        return "Check in and check out are required ."
    }

    const check_in = String(bookingData.check_in)
    const check_out = String(bookingData.check_out)

    //Dates have a format:YYYY-MM-DD 
    if (check_in.length !== 10 || check_out.length !== 10) {
        return "Dates format is YYYY-MM-DD"
    }

    //Compares the check in and out dates 
    if (check_out <= check_in) {
        return "Check out date must be after check in"
    }

    const rooms_wanted = Number(bookingData.number_of_rooms)
    const guests = Number(bookingData.number_of_guests)

    //check the type of the room ,should be a number 
    if (isNaN(rooms_wanted) || !Number.isInteger(rooms_wanted) || rooms_wanted < 1) {
        return "Number of rooms must be a number starting at 1"
    }

    //Checks the type of number of guests,should be a number.

    if (isNaN(guests) || !Number.isInteger(guests) || guests < 1) {
        return "Number of guests must be a number starting at 1 ."
    }

    return ""
}

//checks number of rooms already booked of certain type 

const getBookedRooms = async (room_id: number, check_in: string, check_out: string, cancel_bookid: number) => {

    const result = await connectionPool.query(
        `SELECT COALESCE(SUM(number_of_rooms),0) AS booked FROM bookings 
        WHERE room_id=$1 AND status<>'cancelled' AND check_in<$3 AND check_out>$2 AND id<>$4`,
        [room_id, check_in, check_out, cancel_bookid]
    )

    //converts booked sum  to a number 
    return Number(result.rows[0].booked)
}

//Saves a notification for a user 

const addNotification = async (user_id: number, message: string) => {
    await connectionPool.query("INSERT INTO notifications (user_id,message) VALUES ($1,$2)", [user_id, message]
    )
}

//calculate number of nights  of the given 2 dates 

const getNights = (check_in: string, check_out: string) => {
    const one_day = 1000 * 60 * 60 * 24
    return Math.round((Date.parse(check_out) - Date.parse(check_in)) / one_day)
}

//gets the name of the hotel the room belongs to 
const getHotelNameByRoom = async (room_id: number) => {
    const result = await connectionPool.query(
        "SELECT name FROM hotels WHERE id=(SELECT  hotel_id FROM rooms WHERE id=$1)", [room_id]
    )
    if (result.rows.length === 0) {
        return "The hotel"
    }
    return result.rows[0].name
}

//create a booking for the logged in user 
export const createBooking = async (req: Request, res: Response) => {
    try {
        const booking_data = req.body

        // id comes from the user token 

        const user_id = res.locals.userId

        const room_id = Number(booking_data.room_id)
        if (isNaN(room_id)) {
            return res.status(400).json({ message: "Room id is required and must be a number." })
        }
        const errorMessage = getBookingsErrors(booking_data)

        if (errorMessage !== "") {
            return res.status(400).json({ message: errorMessage })
        }
        const check_in = String(booking_data.check_in)
        const check_out = String(booking_data.check_out)
        const rooms_wanted = Number(booking_data.number_of_rooms)
        const guests = Number(booking_data.number_of_guests)

        //ensure that the booking date is not time of past 
        const today = new Date().toISOString().split("T")[0]
        if (check_in < today) {
            return res.status(400).json({ message: "Check in cannot be in the past." })
        }

        //Checks if room exist and is marked active 
        const room_result = await connectionPool.query(
            "SELECT id,hotel_id,capacity,price_per_night,total_rooms FROM rooms WHERE id=$1 AND is_active=TRUE",
            [room_id]
        )
        if (room_result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found." })
        }

        const room = room_result.rows[0]

        //All guests fit in the rooms 
        if (guests > room.capacity * rooms_wanted) {
            return res.status(400).json({ message: "Thos room type fits" + room.capacity + "guest(s) per rooom.Choose mroe rooms or fewer guests" })
        }

        //checks if the room is already booked and rooms wanted are not more than what the hotel has

        const booked = await getBookedRooms(room_id, check_in, check_out, 0)
        if (booked + rooms_wanted > room.total_rooms) {
            return res.status(409).json({ message: "Not enough rooms are available for the dates." })
        }
        //calculates the price
        const nights = getNights(check_in, check_out)
        const total_price = Math.round(Number(room.price_per_night) * nights * rooms_wanted * 100) / 100


        //booking status is set to pending until admin approves it 

        const results = await connectionPool.query(
            `INSERT INTO bookings(user_id,room_id,check_in,check_out,number_of_rooms,number_of_guests,total_price,status)
            VALUES($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING id`, [user_id, room_id, check_in, check_out, rooms_wanted, guests, total_price]
        )

        const hotel_name = await getHotelNameByRoom(room_id)
        await addNotification(user_id, "Your booking at" + hotel_name + "is waiting for approval")

        //Send back the full booking,with the hotel and room name 

        const new_booking = await connectionPool.query(
            select_booking + "WHERE id=$1", [results.rows[0]]
        )

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not create the booking" })
    }
}
