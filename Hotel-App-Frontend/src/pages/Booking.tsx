import { useState } from "react"
import { useParams, useNavigate, useLocation} from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"

const Booking = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    // Get selected dates and guests from the previous page
    const searchDetails = location.state || {}
    const [checkIn, setCheckIn] = useState(searchDetails.checkIn || "")
    const [checkOut, setCheckOut] = useState(searchDetails.checkOut || "")
    const [guests, setGuests] = useState(searchDetails.guests || 1)
    const [numberOfRooms, setNumberOfRooms] = useState(1)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const today = new Date().toLocaleDateString("en-CA")

    const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
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
        // Get the logged-in user's token
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login", { state: { from: location.pathname, checkIn, checkOut, guests } })
            return
        }
        try {
            setLoading(true)
            // Save the booking in the database
            const bookingResponse = await axios.post(
                "http://localhost:5000/api/bookings", { room_id: parseInt(roomId), check_in: checkIn, check_out: checkOut, number_of_rooms: numberOfRooms, number_of_guests: guests },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            // Get the booking ID returned by the backend
            const bookingId = bookingResponse.data.id
            // Initialize payment for the booking
            const paymentResponse = await axios.post("http://localhost:5000/api/payments", { booking_id: bookingId }, { headers: { Authorization: `Bearer ${token}` } }
            )
            // Redirect the user to Paystack checkout
            window.location.href = paymentResponse.data.authorization_url
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

    return (
        <div className="booking-page">
            <Texts variant="h1">Book Your Room</Texts>
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
                {error && <Texts variant="p">{error}</Texts>}
                <button type="button" onClick={() => navigate(`/rooms/${roomId}`, { state: { checkIn, checkOut, guests } })}>Back to Room</button>
                <button type="submit" disabled={loading}> {loading ? "Processing..." : "Continue to Payment"}</button>
            </form>
        </div>
    )
}

export default Booking