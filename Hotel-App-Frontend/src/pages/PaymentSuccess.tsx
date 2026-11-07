import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [bookingId, setBookingId] = useState<number | null>(null)

    const reference = searchParams.get("reference")

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                setError("Payment reference is missing.")
                setLoading(false)
                return
            }
            const token = localStorage.getItem("token")
            if (!token) {
                setError("Please log in to verify your payment.")
                setLoading(false)
                return
            }
            try {
                const response = await api.get(`/api/payments/verify/${encodeURIComponent(reference)}`,
                    { headers: { Authorization: `Bearer ${token}` } })

                if (response.data.status === "paid" && response.data.booking_id) {
                    setBookingId(response.data.booking_id)
                } else {
                    setError("Payment has not been confirmed.")
                }

            }
            catch (error) {
                console.log(error)
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || "Could not verify payment. Please try again.")
                } else {
                    setError("Could not verify payment. Please try again.")
                }
            }
            finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [reference])

    if (loading) {
        return <Texts variant="p">Verifying your payment...</Texts>
    }

    if (error) {
        return (
            <div className="payment-success-page">
                <Texts variant="h1">Payment Not Confirmed</Texts>
                <Texts variant="p">{error}</Texts>
                <button onClick={() => navigate("/bookings")}> View My Bookings</button>
            </div>
        )
    }
    return (
        <div className="payment-success-page">
            <Texts variant="h1">Payment Successful!</Texts>
            <Texts variant="p">Your payment has been received successfully.
                Your reservation is awaiting confirmation from the admin.  </Texts>
            <Texts variant="p">You can check your reservation status under My Bookings. </Texts>
            <button onClick={() => navigate(`/bookings/${bookingId}`)}> View Booking Details</button>
        </div>
    )

}

export default PaymentSuccess