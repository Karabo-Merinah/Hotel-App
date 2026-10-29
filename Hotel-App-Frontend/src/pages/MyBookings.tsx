import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import type { Booking } from "../types/hotel"
import { Texts } from "../components/Texts/texts"
import "../styles/MyBookings.css"
import { CalendarX, Luggage } from "lucide-react"

const MyBookings = () => {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const getBookings = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await axios.get("http://localhost:5000/api/bookings/myBookings", { headers: { Authorization: `Bearer ${token}` } })
            setBookings(response.data)
        } catch (error) {
            console.log(error)

            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setError("Your session has expired. Please log in again.")
            } else {
                setError("Could not load your bookings.")
            }
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getBookings()
    }, [])
    if (loading) {
        return <Texts variant="p">Loading bookings...</Texts>
    }
    return (
        <div className="bookings-container">
            <button className="bookings-back-button" type="button" onClick={() => navigate("/profile")}>← Back</button>
            <Texts variant="h1">My Bookings</Texts>
            {error && <Texts variant="p" className="bookings-error">{error}</Texts>}
            {!error && bookings.length === 0 && (
                <div className="bookings-empty">
                    <div className="bookings-empty-icons">
                        <Luggage size={65} strokeWidth={1.5} />
                        <CalendarX size={40} strokeWidth={1.5} />
                    </div>
                    <Texts variant="h2">No bookings yet</Texts>
                    <Texts variant="p">
                        You haven't made any reservations yet.
                        Explore our hotels and find your perfect stay.
                    </Texts>
                    <button type="button" onClick={() => navigate("/")}>Explore Hotels </button>
                </div>
            )}
            {!error && bookings.length > 0 && (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div className="booking-card" key={booking.id}>
                            <Texts variant="h2">{booking.hotel_name}</Texts>
                            <Texts variant="p">Room: {booking.room_type}</Texts>
                            <Texts variant="p">Check-in: {booking.check_in}</Texts>
                            <Texts variant="p">Check-out: {booking.check_out}</Texts>
                            <Texts variant="p">Guests: {booking.number_of_guests}</Texts>
                            <Texts variant="p">Rooms: {booking.number_of_rooms}</Texts>
                            <Texts variant="p">Status: {booking.status}</Texts>
                            <Texts variant="p">Total: R{Number(booking.total_price).toFixed(2)}</Texts>
                            <div className="booking-buttons">
                                <button type="button" onClick={() => navigate(`/bookings/${booking.id}`)}>View Booking</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyBookings