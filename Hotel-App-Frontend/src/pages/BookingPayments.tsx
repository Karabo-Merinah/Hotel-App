import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"
import type { Booking as BookingType } from "../types/hotel"

const BookingPayment = () => {
    const { id } = useParams()
    const [booking, setBooking] = useState<BookingType | null>(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)


    const getBooking = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await axios.get(`http://localhost:5000/api/bookings/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setBooking(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load booking.")
        }
    }
    useEffect(() => {
        getBooking()
    }, [id])

    const handlePayment = async () => {
        if (!booking || booking.status !== "pending") return
        try {
            setLoading(true)
            setError("")
            const token = localStorage.getItem("token")
            const response = await axios.post("http://localhost:5000/api/payments", { booking_id: booking.id },
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
            setLoading(false)
        }
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
                        <button onClick={handlePayment} disabled={loading}>{loading ? "Processing..." : "Proceed to Payment"}</button>
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
