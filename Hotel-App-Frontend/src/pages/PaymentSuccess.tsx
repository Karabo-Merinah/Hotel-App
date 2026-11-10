import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import "../styles/PaymentSuccess.css"

const PaymentSuccess = () => {
     console.log("PaymentSuccess component rendered")
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
                    {headers: {  Authorization: `Bearer ${token}` }
                    }
                )

                if (
                    response.data.status === "paid" &&
                    response.data.booking_status === "confirmed"
                ) {
                    setBookingId(response.data.booking_id)
                }
                else {
                    setError("Your payment has not been confirmed yet.")
                }
            }
            catch (error) {
                console.log(error)
                if (axios.isAxiosError(error)) {
                    setError(
                        error.response?.data?.message ||
                        "Could not verify payment. Please try again."
                    )
                }
                else {
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
                    <Texts variant="h1">Payment Verification</Texts>
                    <Texts variant="p">{error}</Texts>
                    <Texts variant="p">If your payment was deducted, do not pay again until its status has been checked.</Texts>
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
                <Texts variant="p">Your payment has been verified and your booking is confirmed.</Texts>
                <Texts variant="p">No admin approval is required.</Texts>
                <button className="payment-success-button" type="button" onClick={() => navigate("/bookings", {
                        state: {popup: "Payment successful! Your booking is confirmed." }})}>View My Bookings</button>
                {bookingId && (
                    <button className="payment-success-button" type="button" onClick={() => navigate(`/bookings/${bookingId}`)} >View Booking Details</button>
                )}
            </div>
        </div>
    )
}

export default PaymentSuccess
