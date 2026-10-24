import { Request, Response } from "express"
import connectionPool from "../config/database"

const select_booking = `SELECT id,user_id,room_id,TO_CHAR(check_in,'YYYY-MM-DD') AS check_in,
TO_CHAR(check_out,'YYYY-MM-DD') AS check_out,number_of_rooms,number_of_guests,total_price,status,created_at,
(SELECT name FROM users WHERE users.id=bookings.user_id) AS guest_name,
(SELECT email FROM users WHERE users.id=bookings.user_id) AS guest_email,
(SELECT room_type FROM rooms WHERE rooms.id=bookings.room_id) AS room_type,
(SELECT name FROM hotels WHERE hotels.id=(SELECT hotel_id FROM rooms WHERE rooms.id=bookings.room_id)) AS hotel_name
FROM bookings `

//checks the dates ,rooms and guest sent in booking.

const getBookingsErrors = (bookingData: any) => {

    //checks if the check in and check out  dates are filled in 
    if (!bookingData.check_in || !bookingData.check_out) {
        return "Check in and check out are required ."
    }

    const check_in = String(bookingData.check_in)
    const check_out = String(bookingData.check_out)

    //Dates have a format:YYYY-MM-DD 
    if (check_in.length !== 10 || check_out.length !== 10 || isNaN(Date.parse(check_in)) || isNaN(Date.parse(check_out))) {
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

//checks number of rooms already booked of certain type by ignoring the provided booking id 

const getBookedRooms = async (room_id: number, check_in: string, check_out: string, not_counted_booking: number) => {

    const result = await connectionPool.query(
        `SELECT COALESCE(SUM(number_of_rooms),0) AS booked FROM bookings 
        WHERE room_id=$1 AND status<>'cancelled' AND check_in<$3 AND check_out>$2 AND id<>$4`,
        [room_id, check_in, check_out, not_counted_booking]
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
            return res.status(400).json({ message: "This room type fits " + room.capacity + " guest(s) per room. Choose more rooms or fewer guests" })
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
        await addNotification(user_id, "Your booking at " + hotel_name + " is waiting for approval")

        //Send back the full booking,with the hotel and room name 

        const new_booking = await connectionPool.query(
            select_booking + "WHERE id=$1", [results.rows[0].id]
        )
        return res.status(201).json(new_booking.rows[0])

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not create the booking" })
    }
}
//gets the bookings of the logged in user  putting new bookings on top 

export const getMyBookings = async (res: Response) => {
    try {
        const user_id = res.locals.userId

        const result = await connectionPool.query(
            select_booking + "WHERE user_id=$1 ORDER BY check_in DESC", [user_id]
        )
        return res.status(200).json(result.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get your bookings." })
    }
}

//ensures user only sees their own bookings 

export const getBookingById = async (req: Request, res: Response) => {
    try {
        const booking_id = Number(req.params.id)

        if (isNaN(booking_id)) {
            return res.status(400).json({ message: "Booking id must be a number." })
        }

        const result = await connectionPool.query(
            select_booking + "WHERE id =$1", [booking_id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found." })
        }
        const booking = result.rows[0]

        //stop users from accessing other user's bookings 

        if (res.locals.role !== "admin" && booking.user_id !== res.locals.userId) {
            return res.status(403).json({ message: "You can only view your own bookings." })
        }
        return res.status(200).json(booking)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get booking." })
    }
}

//get all reservation ,new stays on top

export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const status = req.query.status

        if (status) {
            if (status !== "pending" && status !== "confirmed" && status !== "cancelled") {
                return res.status(400).json({ message: "Status must be pending,confirmed or cancelled." })
            }
            const filtered = await connectionPool.query(
                select_booking + "WHERE status=$1 ORDER BY check_in DESC", [status]
            )
            return res.status(200).json(filtered.rows)
        }
        const result = await connectionPool.query(
            select_booking + "ORDER BY check_in DESC"
        )
        return res.status(200).json(result.rows)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get reservations." })
    }
}

//admin approves or cancels the booking 

export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const booking_id = Number(req.params.id)

        if (isNaN(booking_id)) {
            return res.status(400).json({ message: "Booking id must be a number." })
        }
        const new_status = req.body.status

        if (new_status !== "confirmed" && new_status !== "cancelled") {
            return res.status(400).json({ message: "Status must be either confirmed or cancelled." })
        }

        const booking_results = await connectionPool.query(
            "SELECT id,user_id,room_id,status FROM bookings WHERE id=$1", [booking_id]
        )

        if (booking_results.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found." })
        }
        const booking = booking_results.rows[0]


        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "A cancelled booking cannot be changed." })
        }
        if (booking.status === new_status) {
            return res.status(400).json({ message: "The booking is already " + new_status })
        }

        await connectionPool.query("UPDATE bookings SET status=$1 WHERE id=$2", [new_status, booking_id])

        //gives user feedback 
        const hotel_name = await getHotelNameByRoom(booking.room_id)
        if (new_status === "confirmed") {
            await addNotification(booking.user_id, "Your booking at " + hotel_name + " is confirmed.")
        }
        else {
            await addNotification(booking.user_id, "Your booking at " + hotel_name + " was cancelled.")
        }

        const updated_booking = await connectionPool.query(
            select_booking + "WHERE id=$1", [booking_id]
        )
        return res.status(200).json(updated_booking.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not update the booking status." })
    }
}


//updates booking

export const updateBooking = async (req: Request, res: Response) => {
    try {
        const booking_id = Number(req.params.id)

        if (isNaN(booking_id)) {
            return res.status(400).json({ message: "Booking id must be a number." })
        }

        const bookingData = req.body

        const room_id = Number(bookingData.room_id)
        if (isNaN(room_id)) {
            return res.status(400).json({ message: "Room id is required and must be a number." })
        }

        const errorMessage = getBookingsErrors(bookingData)
        if (errorMessage !== "") {
            return res.status(400).json({ message: errorMessage })
        }

        const check_in = String(bookingData.check_in)
        const check_out = String(bookingData.check_out)
        const rooms_wanted = Number(bookingData.number_of_rooms)
        const guests = Number(bookingData.number_of_guests)

        //The booking must exist and must not be cancelled
        const booking_result = await connectionPool.query(
            "SELECT id,user_id,status FROM bookings WHERE id=$1", [booking_id]
        )
        if (booking_result.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found." })
        }
        const booking = booking_result.rows[0]

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "A cancelled booking cannot be changed." })
        }

        //The room must exist and be switched on
        const room_result = await connectionPool.query(
            "SELECT id,hotel_id,capacity,price_per_night,total_rooms FROM rooms WHERE id=$1 AND is_active=TRUE",
            [room_id]
        )
        if (room_result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found." })
        }
        const room = room_result.rows[0]

        if (guests > room.capacity * rooms_wanted) {
            return res.status(400).json({ message: "This room type fits " + room.capacity + " guest(s) per room. Choose more rooms or fewer guests." })
        }

        //Same availability check as creating, but this booking's own rooms are not counted twice
        const booked = await getBookedRooms(room_id, check_in, check_out, booking_id)
        if (booked + rooms_wanted > room.total_rooms) {
            return res.status(409).json({ message: "Not enough rooms are available for these dates." })
        }

        //Work out the new price
        const nights = getNights(check_in, check_out)
        const total_price = Math.round(Number(room.price_per_night) * nights * rooms_wanted * 100) / 100

        await connectionPool.query(
            `UPDATE bookings SET room_id=$1,check_in=$2,check_out=$3,number_of_rooms=$4,number_of_guests=$5,total_price=$6
             WHERE id=$7`,
            [room_id, check_in, check_out, rooms_wanted, guests, total_price, booking_id]
        )

        const hotel_name = await getHotelNameByRoom(room_id)
        await addNotification(booking.user_id, "Your booking at " + hotel_name + " was changed. Please check the new details.")

        const updated_booking = await connectionPool.query(
            select_booking + "WHERE id=$1", [booking_id]
        )
        return res.status(200).json(updated_booking.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not update the booking." })
    }
}

