import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import type { Booking } from "../types/hotel"
import { Texts } from "../components/Texts/texts"
import "../styles/BookingDetails.css"

const BookingDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [cancelling, setCancelling] = useState(false)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const getBooking = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`http://localhost:5000/api/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            setBooking(response.data)
        } catch (error) {
            console.log(error)
            setError("Could not load booking details.")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getBooking()
    }, [id])
    if (loading) {
        return <Texts variant="p">Loading booking details...</Texts>
    }
    const cancelBooking = async () => {
        if (!booking) return
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        )
        if (!confirmed) return
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setCancelling(true)
            setError("")
            setMessage("")
            const response = await axios.put(`http://localhost:5000/api/bookings/${booking.id}/cancel`,{},{ headers: { Authorization: `Bearer ${token}` } }
            )
            setBooking(response.data)
            setMessage("Your booking has been cancelled successfully.")
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not cancel booking.")
            } else {
                setError("Could not cancel booking.")
            }
        }
        finally {
            setCancelling(false)
        }
    }
    return (
        <div className="booking-details-container">
            <button type="button" onClick={() => navigate("/bookings")}>← Back to My Bookings </button>
            <Texts variant="h1">Booking Details</Texts>
            {error && <Texts variant="p">{error}</Texts>}
            {message && <Texts variant="p" className="booking-success">{message}</Texts>}
            {!error && booking && (
                <div className="booking-details-card">
                    <Texts variant="h2">{booking.hotel_name}</Texts>
                    <Texts variant="p">Booking Reference-{booking.id}</Texts>
                    <Texts variant="p"> Room Type: {booking.room_type}</Texts>
                    <Texts variant="p"> Check-in: {booking.check_in}</Texts>
                    <Texts variant="p">Check-out: {booking.check_out}</Texts>
                    <Texts variant="p">Guests: {booking.number_of_guests}</Texts>
                    <Texts variant="p">Rooms: {booking.number_of_rooms} </Texts>
                    <Texts variant="p">Status: {booking.status}</Texts>
                    <Texts variant="h2">Total: R{Number(booking.total_price).toFixed(2)}</Texts>
                    {booking.status === "pending" && (
                        <button type="button" className="cancel-booking-button" onClick={cancelBooking} disabled={cancelling}>{cancelling ? "Cancelling..." : "Cancel Booking"}</button>
                    )}
                </div>
            )}
        </div>
    )
}
export default BookingDetails