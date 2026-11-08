import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import "../styles/PaymentSuccess.css"

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [bookingId, setBookingId] = useState<number | null>(null)

     // get the payment reference from the URL
    const reference = searchParams.get("reference")

    useEffect(() => {
        // verify the payment with the backend
        const verifyPayment = async () => {
            // check if the payment reference exists
            if (!reference) {
                setError("Payment reference is missing.")
                setLoading(false)
                return
            }
            // get the user's authentication token
            const token = localStorage.getItem("token")
             // prevent verification if the user is not logged in
            if (!token) {
                setError("Please log in to verify your payment.")
                setLoading(false)
                return
            }
            try {
                 // sends the payment reference to the backend for verification
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
        // runs payment verification when the page loads
        verifyPayment()
    }, [reference])
     // display a loading message while verifying payment
    if (loading) {
        return (
            <div className="payment-success-page">
                <Texts variant="p">Verifying your payment...</Texts>
            </div>
        )
    }

    if (error) {
        return (
            <div className="payment-success-page">
                <div className="payment-success-card">
                    <Texts variant="h1">Payment Not Confirmed</Texts>
                    <Texts variant="p">{error}</Texts>
                    <button className="payment-success-button" type="button" onClick={() => navigate("/bookings")}>View My Bookings</button>
                </div>
            </div>
        )
    }
    return (
        <div className="payment-success-page">
            <div className="payment-success-card">
                <div className="payment-success-icon">✓</div>
                <Texts variant="h1">Payment Successful!</Texts>
                <Texts variant="p">Your payment has been received successfully.</Texts>
                 {/* Inform the user that admin approval is still required */}
                <Texts variant="p">Your reservation is awaiting confirmation from the admin.</Texts>
                <Texts variant="p">You can check your reservation status under My Bookings.</Texts>
                <button className="payment-success-button" type="button" onClick={() => navigate(`/bookings/${bookingId}`)}>View Booking Details</button>
            </div>
        </div>
    )

}

export default PaymentSuccess