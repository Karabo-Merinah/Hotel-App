import { Request, Response } from "express"
import connectionPool from "../config/database"
import { PoolClient } from "pg"

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
    //ensure that the booking date is not time of past 
    if (check_in < new Date().toISOString().slice(0, 10)) {
        return "Check in cannot be in the past "
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
const getBookedRooms = async (room_id: number, check_in: string, check_out: string, excluded_id: number, client: PoolClient) => {

    const result = await client.query(`SELECT COALESCE(SUM(number_of_rooms), 0) AS booked
         FROM bookings WHERE room_id = $1 AND status IN ('pending', 'confirmed')
         AND check_in < $3 AND check_out > $2 AND id <> $4`,
        [room_id, check_in, check_out, excluded_id]
    )

    // converts it to the number format
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

    const client = await connectionPool.connect()

    try {
        const booking_data = req.body
        const user_id = res.locals.userId

        const room_id = Number(booking_data.room_id)

        if (!Number.isInteger(room_id) || room_id <= 0) {
            return res.status(400).json({ message: "Room id must be a positive number." })
        }

        const errorMessage = getBookingsErrors(booking_data)

        if (errorMessage !== "") {
            return res.status(400).json({ message: errorMessage })
        }

        const check_in = String(booking_data.check_in)
        const check_out = String(booking_data.check_out)
        const rooms_wanted = Number(booking_data.number_of_rooms)
        const guests = Number(booking_data.number_of_guests)

        // Start transaction
        await client.query("BEGIN")

        // Lock the selected room while checking availability
        const room_result = await client.query(`SELECT * FROM rooms WHERE id = $1 AND is_active = TRUE
             FOR UPDATE`, [room_id])

        if (room_result.rows.length === 0) {
            await client.query("ROLLBACK")

            return res.status(404).json({
                message: "Room not found."
            })
        }

        const room = room_result.rows[0]

        // Check if the hotel is active
        const hotel_result = await client.query(`SELECT id FROM hotels WHERE id = $1 AND is_active = TRUE`, [room.hotel_id])

        if (hotel_result.rows.length === 0) {
            await client.query("ROLLBACK")

            return res.status(404).json({ message: "Hotel not found." })
        }

        // Check guest capacity
        if (guests > room.capacity * rooms_wanted) {
            await client.query("ROLLBACK")
            return res.status(400).json({ message: "The selected rooms cannot accommodate all guests." })
        }

        // Check available rooms
        const booked = await getBookedRooms(room_id, check_in, check_out, 0, client)

        if (booked + rooms_wanted > room.total_rooms) {
            await client.query("ROLLBACK")

            return res.status(409).json({ message: "Not enough rooms available for these dates." })
        }

        // Calculate total price
        const nights = getNights(check_in, check_out)

        const total_price = Math.round(Number(room.price_per_night) * nights * rooms_wanted * 100) / 100

        // Save booking
        const result = await client.query(
            `INSERT INTO bookings (user_id, room_id, check_in, check_out,
             number_of_rooms, number_of_guests, total_price, status) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING id`,
            [user_id, room_id, check_in, check_out, rooms_wanted, guests, total_price]
        )

        // Complete transaction
        await client.query("COMMIT")

        const booking_id = result.rows[0].id

        // Send notification
        const hotel_name = await getHotelNameByRoom(room_id)

        await addNotification(user_id, "Your booking at " + hotel_name + " is waiting for approval.")

        // Return booking details
        const new_booking = await connectionPool.query(select_booking + "WHERE id = $1", [booking_id])

        return res.status(201).json(new_booking.rows[0])

    } catch (error) {
        await client.query("ROLLBACK")
        console.log(error)
        return res.status(500).json({ message: "Could not create the booking." })

    } finally {
        client.release()
    }
}
//gets the bookings of the logged in user  putting new bookings on top 

export const getMyBookings = async (req: Request, res: Response) => {
    try {
        const user_id = res.locals.userId

        const result = await connectionPool.query(select_booking + "WHERE user_id=$1 ORDER BY check_in DESC", [user_id])
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
            if (status !== "pending" && status !== "confirmed" && status !== "cancelled" && status !== "completed") {
                return res.status(400).json({ message: "Status must be pending,confirmed,completed or cancelled." })
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
        if (booking.status === "completed") {
            return res.status(400).json({ message: "A completed booking cannot be changed." })
        }
        if (booking.status === new_status) {
            return res.status(400).json({ message: "The booking is already " + new_status })
        }

        await connectionPool.query("UPDATE bookings SET status=$1 , updated_at=NOW() WHERE id=$2", [new_status, booking_id])

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

// Update an existing booking
export const updateBooking = async (req: Request, res: Response) => {
    const booking_id = Number(req.params.id)

    if (!Number.isInteger(booking_id) || booking_id <= 0) {
        return res.status(400).json({ message: "Booking id must be a positive number." })
    }

    const bookingData = req.body
    const room_id = Number(bookingData.room_id)

    if (!Number.isInteger(room_id) || room_id <= 0) {
        return res.status(400).json({ message: "Room id must be a positive number." })
    }

    const errorMessage = getBookingsErrors(bookingData)

    if (errorMessage !== "") {
        return res.status(400).json({ message: errorMessage })
    }

    const check_in = String(bookingData.check_in)
    const check_out = String(bookingData.check_out)
    const rooms_wanted = Number(bookingData.number_of_rooms)
    const guests = Number(bookingData.number_of_guests)

    let client: PoolClient | undefined

    try {
        client = await connectionPool.connect()

        await client.query("BEGIN")

        // Lock the booking before updating it
        const booking_result = await client.query("SELECT * FROM bookings WHERE id=$1 FOR UPDATE", [booking_id]
        )

        if (booking_result.rows.length === 0) {
            await client.query("ROLLBACK")

            return res.status(404).json({ message: "Booking not found." })
        }

        const booking = booking_result.rows[0]

        // Cancelled or completed bookings cannot be updated
        if (booking.status === "cancelled" ||
            booking.status === "completed") {

            await client.query("ROLLBACK")

            return res.status(400).json({ message: "This booking cannot be updated." })
        }

        // Lock the selected room
        const room_result = await client.query(
            `SELECT rooms.* FROM rooms, hotels WHERE rooms.hotel_id = hotels.id
             AND rooms.id = $1 AND rooms.is_active = TRUE
             AND hotels.is_active = TRUE FOR UPDATE OF rooms`,
            [room_id])

        if (room_result.rows.length === 0) {
            await client.query("ROLLBACK")

            return res.status(404).json({ message: "Room not found or hotel is inactive." })
        }

        const room = room_result.rows[0]

        // Check guest capacity
        if (guests > room.capacity * rooms_wanted) {
            await client.query("ROLLBACK")

            return res.status(400).json({
                message: "The selected rooms cannot accommodate all guests."
            })
        }

        // Check available rooms
        const booked = await getBookedRooms(room_id, check_in, check_out, booking_id, client)

        if (booked + rooms_wanted > room.total_rooms) {
            await client.query("ROLLBACK")

            return res.status(409).json({ message: "Not enough rooms available for these dates." })
        }

        // Calculate booking price
        const nights = getNights(check_in, check_out)

        const total_price = Math.round(Number(room.price_per_night) * nights * rooms_wanted * 100) / 100

        // Update booking information
        await client.query(`UPDATE bookings SET room_id=$1,check_in=$2,check_out=$3,
                 number_of_rooms=$4,number_of_guests=$5,total_price=$6,updated_at=NOW()WHERE id=$7`,
            [room_id, check_in, check_out, rooms_wanted, guests, total_price, booking_id]
        )

        // Save changes
        await client.query("COMMIT")

        // Notify the user
        try {
            const hotel_name = await getHotelNameByRoom(room_id);

            await addNotification(booking.user_id, "Your booking at " + hotel_name + " was updated.")
        } catch (error) {
            console.log("Notification error:", error)
        }

        // Return updated booking
        const updated_booking = await connectionPool.query(select_booking + "WHERE id=$1", [booking_id])

        return res.status(200).json(updated_booking.rows[0])

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(console.log)
        }
        console.log(error)
        return res.status(500).json({ message: "Could not update the booking." })
    } finally {
        if (client) {
            client.release()
        }
    }
}

