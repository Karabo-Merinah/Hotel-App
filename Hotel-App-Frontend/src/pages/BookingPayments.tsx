import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import { useDispatch, useSelector } from "react-redux"
import { addBooking } from "../features/bookingSlice"
import type { RootState } from "../app/store"


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
        if (!booking || booking.status !== "pending") return
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
            const response = await api.post("/api/payments", { booking_id: booking.id },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            window.location.href = response.data.authorization_url
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
            <Texts variant="h1">Confirm Your Booking</Texts>
            {error && <Texts variant="p">{error}</Texts>}
            {booking && (
                <>
                    <Texts variant="p">Hotel: {booking.hotel_name}</Texts>
                    <Texts variant="p">Room: {booking.room_type}</Texts>
                    <Texts variant="p">Check-in: {booking.check_in}</Texts>
                    <Texts variant="p">Check-out: {booking.check_out}</Texts>
                    <Texts variant="p">Rooms: {booking.number_of_rooms}</Texts>
                    <Texts variant="p">Guests: {booking.number_of_guests}</Texts>
                    <Texts variant="h2"> Total: R{Number(booking.total_price).toFixed(2)}</Texts>
                    {booking.status === "pending" && (
                        <button onClick={handlePayment} disabled={processing}>{processing ? "Processing..." : "Proceed to Payment"}</button>
                    )}
                    {booking.status !== "pending" && (
                        <Texts variant="p">Booking status: {booking.status}</Texts>
                    )}
                </>
            )}
        </div>
    )
}
export default BookingPayment
