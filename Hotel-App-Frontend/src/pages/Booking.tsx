import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Texts } from "../components/Texts/texts"

const Booking = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    //gets the selected dates and guests from home page 
    const searchDetails = location.state || {}
    const [checkIn, setCheckIn] = useState(searchDetails.checkIn || "")
    const [checkOut, setCheckOut] = useState(searchDetails.checkOut || "")
    const [guests, setGuests] = useState(searchDetails.guests || 1)
    const [error, setError] = useState("")

    const today = new Date().toLocaleDateString("en-CA")
    const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
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
        console.log("Booking details:", { roomId, checkIn, checkOut, guests })
    }
    return (
        <div className="booking-page">
            <Texts variant="h1">Book Your Room</Texts>
            <form onSubmit={handleBooking}>
                <div>
                    <label htmlFor="checkIn">Check-in Date</label>
                    <input type="date" id="checkIn" value={checkIn} min={today} onChange={(e) => { setCheckIn(e.target.value); setCheckOut("") }} required />
                </div>
                <div>
                    <label htmlFor="checkOut">Check-out Date</label>
                    <input type="date" id="checkOut" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="guests">Number of Guests</label>
                    <input type="number" id="guests" min="1" value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} required />
                </div>
                {error && <Texts variant="p">{error}</Texts>}
                <button type="button" onClick={() => navigate(`/rooms/${roomId}`, { state: { checkIn, checkOut, guests } })}>Back to Room</button>
                <button type="submit">Continue Booking</button>
            </form>
        </div>
    )
}
export default Booking