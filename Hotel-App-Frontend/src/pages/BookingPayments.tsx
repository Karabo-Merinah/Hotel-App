import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import { useDispatch, useSelector } from "react-redux"
import { addBooking } from "../features/bookingSlice"
import type { RootState } from "../app/store"
import "../styles/BookingPayment.css"

const BookingPayment = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // Get booking from Redux
    const bookings = useSelector((state: RootState) => state.bookings)
    const booking = bookings.find(booking => booking.id === parseInt(id || "0"))
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)


    const getBooking = async () => {
        try {
            setLoading(true)
            setError("")
            const token = localStorage.getItem("token")

            if (!token) {
                navigate("/login", {
                    state: { from: `/bookings/${id}/payment` }
                })
                return
            }
            const response = await api.get(`/api/bookings/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            // Store the booking in Redux
            dispatch(addBooking(response.data))
        }
        catch (error) {
            console.log(error)
            setError("Could not load booking.")
        }
        finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getBooking()
    }, [id])


    const handlePayment = async () => {
        if (!booking || booking.status !== "pending" || booking.payment_status !== "unpaid") return
        try {
            setProcessing(true)
            setError("")
            const token = localStorage.getItem("token")

            if (!token) {
                navigate("/login", {
                    state: { from: `/bookings/${id}/payment` }
                })
                return
            }
            const response = await api.post("/api/payments",{ booking_id: booking.id },{ headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.status === "paid" && response.data.booking_status === "confirmed"
            ) {
                navigate(`/bookings/${booking.id}`)
            }
            else if (response.data.authorization_url) {
                window.location.href = response.data.authorization_url
            }
            else {
                setError("Could not confirm the payment status.")
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not initialize payment.")
            } else {
                setError("Could not initialize payment.")
            }
        }
        finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return <Texts variant="p">Loading booking details...</Texts>
    }
    if (!booking) {
        return <Texts variant="p">{error || "Booking not found."}</Texts>
    }
    return (
        <div className="booking-confirmation">
            <div className="booking-confirmation-card">
                <Texts variant="h1">Confirm Your Booking</Texts>
                <Texts variant="p">Review your reservation details before proceeding to payment.</Texts>
                {error && <p className="booking-payment-error">{error}</p>}
                <div className="booking-confirmation-details">
                    <div><span>Hotel</span><strong>{booking.hotel_name}</strong></div>
                    <div><span>Room</span><strong>{booking.room_type || "Not available"}</strong></div>
                    <div><span>Check-in</span><strong>{booking.check_in}</strong></div>
                    <div><span>Check-out</span><strong>{booking.check_out}</strong></div>
                    <div><span>Rooms</span><strong>{booking.number_of_rooms}</strong></div>
                    <div><span>Guests</span><strong>{booking.number_of_guests}</strong></div>
                </div>
                <div className="booking-confirmation-total">
                    <Texts variant="h2">Total Amount</Texts>
                    <Texts variant="h2">R{Number(booking.total_price).toFixed(2)}</Texts>
                </div>
                {booking.status === "pending" && booking.payment_status === "unpaid" && (
                    <button className="booking-payment-button" type="button" onClick={handlePayment} disabled={processing}>{processing ? "Processing..." : "Proceed to Payment"}</button>
                )}
                {booking.payment_status === "paid" && (
                    <p className="booking-payment-message">
                        Payment received. Your booking has been confirmed.
                    </p>
                )}
                {booking.status !== "pending" && (
                    <p className="booking-payment-message">Booking status: {booking.status}</p>
                )}
                <button className="booking-payment-back" type="button" onClick={() => navigate("/bookings")}>Back to My Bookings</button>
            </div>
        </div>
    )
}
export default BookingPayment
