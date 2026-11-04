import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../api/axios"
import axios from "axios"
import { Texts } from "../components/Texts/texts"
import "../styles/BookingDetails.css"
import { useDispatch, useSelector } from "react-redux"
import { addBooking, updateBooking } from "../features/bookingSlice"
import type { RootState } from "../app/store"


const BookingDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // Get booking details from Redux
    const bookings = useSelector((state: RootState) => state.bookings)
    const booking = bookings.find(booking => booking.id === parseInt(id || "0"))
    const [cancelling, setCancelling] = useState(false)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const today = new Date().toLocaleDateString("en-CA")
    const canReview = booking?.status === "confirmed" && booking.check_out <= today

    const getBooking = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login", {
                state: { from: `/bookings/${id}` }
            })
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await api.get(`/api/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            // Store the booking in Redux
            dispatch(addBooking(response.data))
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


    const cancelBooking = async () => {
        if (!booking) return
        const confirmed = window.confirm( "Are you sure you want to cancel this booking?")
        if (!confirmed) return
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login", {
                state: { from: `/bookings/${id}` }
            })
            return
        }
        try {
            setCancelling(true)
            setError("")
            setMessage("")
            const response = await api.put(`/api/bookings/${booking.id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } }
            )
            // Update the cancelled booking in Redux
            dispatch(updateBooking(response.data))
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

    if (loading) {
        return <Texts variant="p">Loading booking details...</Texts>
    }
    if (error) {
        return <Texts variant="p">{error}</Texts>
    }
    // Display a message if the booking cannot be loaded
    if (!booking) {
        return <Texts variant="p">{error || "Booking not found."}</Texts>
    }


    return (
        <div className="booking-details-container">
            <button type="button" onClick={() => navigate("/bookings")}>← Back to My Bookings </button>
            <Texts variant="h1">Booking Details</Texts>
            {error && <Texts variant="p">{error}</Texts>}
            {message && <Texts variant="p" className="booking-success">{message}</Texts>}
            {booking && (
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
                        <button type="button" onClick={() => navigate(`/bookings/${booking.id}/payment`)}>Pay Now</button>
                    )}
                    {(booking.status === "pending" || booking.status === "confirmed") && booking.check_in > new Date().toLocaleDateString("en-CA") && (
                        <button type="button" className="cancel-booking-button" onClick={cancelBooking} disabled={cancelling}>{cancelling ? "Cancelling..." : "Cancel Booking"}</button>
                    )}
                    {canReview && (
                        <button type="button" onClick={() => navigate(`/hotels/${booking.hotel_id}/review`)}>Write a Review</button>
                    )}
                </div>
            )}
        </div>

    )
}
export default BookingDetails