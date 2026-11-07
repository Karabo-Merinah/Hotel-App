
import { useEffect, useState } from "react"
import axios from "axios"
import api from "../api/axios"
import { useNavigate } from "react-router-dom"
import { Texts } from "../components/Texts/texts"
import ConfirmDialog from "../components/ConfirmDialog"
import "../styles/MyBookings.css"
import { CalendarX, Luggage } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { setBookings } from "../features/bookingSlice"
import type { RootState } from "../app/store"

const MyBookings = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const bookings = useSelector((state: RootState) => state.bookings)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
    const [cancelling, setCancelling] = useState(false)

    // Get all bookings belonging to the logged-in user
    const getBookings = async () => {
        const token = localStorage.getItem("token")

        // Redirect to login if the user is not authenticated
        if (!token) {
            setLoading(false)
            navigate("/login", { state: { from: "/bookings" } })
            return
        }

        try {
            setLoading(true)
            setError("")
            // Fetch bookings from the backend
            const response = await api.get("/api/bookings/myBookings", { headers: { Authorization: `Bearer ${token}` } })
            dispatch(setBookings(response.data))

        }
        catch (error) {
            console.log(error)

            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setError("Your session has expired. Please log in again.")
            } else {
                setError("Could not load your bookings.")
            }
        }
        finally {
            setLoading(false)
        }
    }

    // Cancel the selected booking after confirmation
    const cancelBooking = async () => {
        if (selectedBookingId === null) return
        const token = localStorage.getItem("token")

        try {
            setCancelling(true)
            setError("")
            // Send cancellation request to the backend
            await api.put(`/api/bookings/${selectedBookingId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } })
            // Close the confirmation dialog
            setSelectedBookingId(null)
            // Refresh bookings after cancellation
            await getBookings()
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not cancel booking.")
            } else {
                setError("Could not cancel booking.")
            }
            // Close the dialog when cancellation fails
            setSelectedBookingId(null)
        }
        finally {
            setCancelling(false)
        }
    }
    // Fetch bookings when the page opens
    useEffect(() => {
        getBookings()
    }, [])

    // Display loading state
    if (loading) {
        return <div className="bookings-container"><Texts variant="p">Loading bookings...</Texts></div>
    }
    return (
        <div className="bookings-container">
            <button className="bookings-back-button" type="button" onClick={() => navigate("/profile")}>← Back</button>
            <Texts variant="h1">My Bookings</Texts>
            {/* Display errors */}
            {error && <p className="bookings-error">{error}</p>}
            {/* Display empty state when there are no bookings */}
            {!error && bookings.length === 0 && (
                <div className="bookings-empty">
                    <div className="bookings-empty-icons">
                        <Luggage size={65} strokeWidth={1.5} />
                        <CalendarX size={40} strokeWidth={1.5} />
                    </div>
                    <Texts variant="h2">No bookings yet</Texts>
                    <Texts variant="p">You haven't made any reservations yet. Explore our hotels and find your perfect stay.</Texts>
                    <button type="button" onClick={() => navigate("/")}>Explore Hotels</button>
                </div>
            )}
            {/* Display all bookings */}
            {!error && bookings.length > 0 && (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div className="booking-card" key={booking.id}>
                            {/* Booking information */}
                            <Texts variant="h2">{booking.hotel_name}</Texts>
                            <Texts variant="p">Room: {booking.room_type || "Not available"}</Texts>
                            <Texts variant="p">Check-in: {booking.check_in}</Texts>
                            <Texts variant="p">Check-out: {booking.check_out}</Texts>
                            <Texts variant="p">Guests: {booking.number_of_guests}</Texts>
                            <Texts variant="p">Rooms: {booking.number_of_rooms}</Texts>
                            <Texts variant="p">Status: {booking.status}</Texts>
                            <Texts variant="p">Payment: {booking.payment_status}</Texts>
                            <Texts variant="p">Total: R{Number(booking.total_price).toFixed(2)}</Texts>
                            <div className="booking-buttons">
                                {/* View booking details */}
                                <button type="button" onClick={() => navigate(`/bookings/${booking.id}`)}>View Booking</button>
                                {/* Show cancellation only for upcoming unpaid bookings */}
                                {(booking.status === "pending" || booking.status === "confirmed") && booking.check_in > new Date().toISOString().slice(0, 10) && booking.payment_status !== "paid" && (
                                    <button type="button" onClick={() => setSelectedBookingId(booking.id)}>Cancel Booking</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Confirmation dialog for cancelling a booking */}
            {selectedBookingId !== null && (
                <ConfirmDialog title="Cancel Booking" message="Are you sure you want to cancel this booking? This action cannot be undone." onConfirm={cancelBooking}
                    onClose={() => setSelectedBookingId(null)} loading={cancelling} />
            )}
        </div>
    )
}

export default MyBookings
