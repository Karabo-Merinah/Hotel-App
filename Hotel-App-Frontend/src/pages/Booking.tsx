import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import type { Room, Hotel } from "../types/hotel"
import { useDispatch } from "react-redux"
import { addBooking } from "../features/bookingSlice"
import axios from "axios"
import Popup from "../components/Popup"
import  "../styles/Bookings.css"


const Booking = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    // Get selected dates and guests from the previous page
    const searchDetails = location.state || {}
    const [checkIn, setCheckIn] = useState(searchDetails.checkIn || "")
    const [checkOut, setCheckOut] = useState(searchDetails.checkOut || "")
    const [guests, setGuests] = useState(searchDetails.guests || 1)
    const [numberOfRooms, setNumberOfRooms] = useState(searchDetails.numberOfRooms || 1)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [room, setRoom] = useState<Room | null>(null)
    const [hotel, setHotel] = useState<Hotel | null>(null)
    const [availableRooms, setAvailableRooms] = useState<number | null>(null)
    const [checkingAvailability, setCheckingAvailability] = useState(false)
    const today = new Date().toLocaleDateString("en-CA")
    const [popup, setPopup] = useState("")


    const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading) return
        setError("")
        // Validate booking dates
        if (!checkIn || !checkOut) {
            setError("Please select your check-in and check-out dates.")
            return
        }
        if (checkIn < today) {
            setError("Check-in date cannot be in the past.")
            return
        }
        if (checkOut <= checkIn) {
            setError("Check-out date must be after check-in date.")
            return
        }
        if (guests < 1 || numberOfRooms < 1) {
            setError("Please enter a valid number of guests and rooms.")
            return
        }
        if (!roomId) {
            setError("Room not found.")
            return
        }
        if (!room || !hotel) {
            setError("Booking details are not available.")
            return
        }
        if (guests > room.capacity * numberOfRooms) {
            setError("The selected rooms cannot accommodate all guests.")
            return
        }
        if (numberOfRooms > room.total_rooms) {
            setError("You cannot book more rooms than this hotel has.")
            return
        }

        // Get the logged-in user's token
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login", { state: { from: location.pathname, checkIn, checkOut, guests, numberOfRooms } })
            return
        }
        try {
            setLoading(true)

            // Check availability again before creating the booking
            const availabilityResponse = await api.get(`/api/bookings/rooms/${roomId}/availability`,
                {
                    params: { check_in: checkIn, check_out: checkOut }
                }
            )
            const currentAvailableRooms = availabilityResponse.data.available_rooms
            // Update the displayed availability
            setAvailableRooms(currentAvailableRooms)

            // Stop if there are not enough rooms
            if (numberOfRooms > currentAvailableRooms) {
                setError("Not enough rooms are available for the selected dates.")
                setPopup("Not enough rooms are available for the selected dates.")
                return
            }
            // Save the booking in the database
            const bookingResponse = await api.post("/api/bookings", { room_id: parseInt(roomId), check_in: checkIn, check_out: checkOut, number_of_rooms: numberOfRooms, number_of_guests: guests },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            // Get the complete booking and store it in Redux
            try {
                const response = await api.get(`/api/bookings/${bookingResponse.data.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                dispatch(addBooking(response.data))
            }
            catch (error) {
                console.log("Could not update Redux bookings:", error)
            }
            // Navigate to booking details and display success notification
            navigate(`/bookings/${bookingResponse.data.id}`, {
                state: { popup: "Your booking has been created successfully!" }
            })
        }
        catch (error) {
            console.log(error)

            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Could not complete booking."
                setError(message)
                setPopup(message)
            } else {
                setError("Something went wrong. Please try again.")
                setPopup("Something went wrong. Please try again.")
            }
        }
        finally {
            setLoading(false)
        }
    }

    const getBookingDetails = async () => {
        try {
            setError("")
            const roomResponse = await api.get(`/api/rooms/${roomId}`)
            setRoom(roomResponse.data)
            const hotelResponse = await api.get(`/api/hotels/${roomResponse.data.hotel_id}`)
            setHotel(hotelResponse.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load booking details.")
        }
    }

    // Fetch the selected room and its hotel details when the page loads and  if the room ID changes
    useEffect(() => {
        getBookingDetails()
    }, [roomId])

    // Checks room availability whenever the room ID or selected dates change
    useEffect(() => {
        // Clear previous availability when dates change
        setAvailableRooms(null)
        setError("")

        // Stop if the dates are missing or invalid
        if (!roomId || !checkIn || !checkOut || checkOut <= checkIn) {
            setCheckingAvailability(false)
            return
        }

        // Prevent an old request from updating availability after dates change
        let cancelled = false

        const checkAvailability = async () => {
            try {
                setCheckingAvailability(true)

                // Get available rooms for the selected dates
                const response = await api.get(`/api/bookings/rooms/${roomId}/availability`, {
                    params: { check_in: checkIn, check_out: checkOut }
                })

                if (!cancelled) {
                    setAvailableRooms(response.data.available_rooms)
                }
            }
            catch (error) {
                console.log(error)
                if (!cancelled) {
                    setAvailableRooms(null)
                    setError("Could not check room availability. Please try again.")
                }
            }
            finally {
                if (!cancelled) {
                    setCheckingAvailability(false)
                }
            }
        }
        checkAvailability()
        // Ignore the previous request if the dates or room change
        return () => {
            cancelled = true
        }
    }, [roomId, checkIn, checkOut])

    // Automatically close the popup after 3 seconds
    useEffect(() => {
        if (!popup) return

        const timer = setTimeout(() => { setPopup("") }, 3000)
        return () => clearTimeout(timer)
    }, [popup])

    return (
        <div className="booking-page">
            {popup && <Popup message={popup} type="error" onClose={() => setPopup("")} />}
            {hotel && room && (
                <div className="booking-details">
                    <Texts variant="h2">Booking Details</Texts>
                    <Texts variant="p">Hotel: {hotel.name}</Texts>
                    <Texts variant="p">Location: {hotel.city}</Texts>
                    <Texts variant="p">Address: {hotel.address}</Texts>
                    <Texts variant="p">Room Type: {room.room_type}</Texts>
                    <Texts variant="p">Capacity: {room.capacity} guests per room</Texts>
                    <Texts variant="p">Price per Night: R{room.price_per_night}</Texts>
                </div>
            )}
            <Texts variant="h1">Book Your Room</Texts>
            {error && <Texts variant="p">{error}</Texts>}
            <form onSubmit={handleBooking}>
                <div>
                    <label htmlFor="checkIn">Check-in Date</label>
                    <input type="date" id="checkIn" value={checkIn} min={today} disabled={loading} onChange={(e) => { setCheckIn(e.target.value); setCheckOut("") }} required />
                </div>
                <div>
                    <label htmlFor="checkOut">Check-out Date</label>
                    <input type="date" id="checkOut" value={checkOut} min={checkIn || today} disabled={loading} onChange={(e) => setCheckOut(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="guests">Number of Guests</label>
                    <input type="number" id="guests" min="1" value={guests} disabled={loading} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} required />
                </div>
                <div>
                    <label htmlFor="numberOfRooms">Number of Rooms</label>
                    <input type="number" id="numberOfRooms" min="1" value={numberOfRooms} disabled={loading} onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)} required />
                </div>
                {checkingAvailability ? (
                    <Texts variant="p">Checking room availability...</Texts>
                ) : availableRooms !== null ? (
                    <Texts variant="p"> Available Rooms: {availableRooms}</Texts>
                ) : (
                    <Texts variant="p">Select valid dates to check availability.</Texts>
                )}
                <button type="button" disabled={loading} onClick={() => navigate(`/rooms/${roomId}`, { state: { checkIn, checkOut, guests, numberOfRooms } })}>Back to Room</button>
                <button type="submit" disabled={loading || checkingAvailability || availableRooms === null || numberOfRooms > availableRooms}>{loading ? "Processing..." : availableRooms !== null && numberOfRooms > availableRooms ? "Not Available" : "Confirm Booking"}</button>
            </form>

        </div>
    )
}
export default Booking