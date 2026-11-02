import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"
import type { Room, Hotel } from "../types/hotel"


const Booking = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

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

    const today = new Date().toLocaleDateString("en-CA")

    const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(loading) return
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
            navigate("/login", { state: { from: location.pathname, checkIn, checkOut, guests } })
            return
        }
        try {
            setLoading(true)
            // Save the booking in the database
            const bookingResponse = await axios.post("http://localhost:5000/api/bookings", { room_id: parseInt(roomId), check_in: checkIn, check_out: checkOut, number_of_rooms: numberOfRooms, number_of_guests: guests },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            // Navigate to the booking confirmation page
         navigate(`/bookings/${bookingResponse.data.id}`)
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not complete booking.")
            }
            else {
                setError("Something went wrong. Please try again.")
            }
        }
        finally {
            setLoading(false)
        }
    }
    const getBookingDetails = async () => {
        try {
            setError("")
            const roomResponse = await axios.get(`http://localhost:5000/api/rooms/${roomId}`)
            setRoom(roomResponse.data)
            const hotelResponse = await axios.get(`http://localhost:5000/api/hotels/${roomResponse.data.hotel_id}`)
            setHotel(hotelResponse.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load booking details.")
        }
    }
    useEffect(() => {
        getBookingDetails()
    }, [roomId])

    return (
        <div className="booking-page">
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
                    <input type="date" id="checkIn" value={checkIn} min={today} onChange={(e) => {
                        setCheckIn(e.target.value)
                        setCheckOut("")
                    }} required />
                </div>
                <div>
                    <label htmlFor="checkOut">Check-out Date</label>
                    <input type="date" id="checkOut" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="guests">Number of Guests</label>
                    <input type="number" id="guests" min="1" value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} required />
                </div>
                <div>
                    <label htmlFor="numberOfRooms">Number of Rooms</label>
                    <input type="number" id="numberOfRooms" min="1" value={numberOfRooms} onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)} required />
                </div>
                <button type="button" onClick={() => navigate(`/rooms/${roomId}`, { state: { checkIn, checkOut, guests,numberOfRooms } })}>Back to Room</button>
                <button type="submit" disabled={loading}> {loading ? "Processing..." : "Review Booking"}</button>
            </form>

        </div>
    )
}

export default Booking