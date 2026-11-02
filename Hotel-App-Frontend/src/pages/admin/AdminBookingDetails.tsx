
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import type { AdminReservation } from "../../types/admin"
import "../../styles/AdminBookingDetails.css"

const AdminBookingDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [booking, setBooking] = useState<AdminReservation | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const getBooking = async () => {
        try {
            setLoading(true)
            setError("")
            const token = localStorage.getItem("token")
            const response = await axios.get(`http://localhost:5000/api/admin/bookings/${id}`,{headers: {Authorization: `Bearer ${token}`}}
            )

            setBooking(response.data)
        } catch (error) {
            console.log(error)
            setError("Could not load reservation details.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getBooking()
    }, [id])

    const updateStatus = async (status: string) => {
        if (!booking) return

        const action = status === "confirmed" ? "approve" : "cancel"

        if (!window.confirm(`Are you sure you want to ${action} this reservation?`)) {
            return
        }

        try {
            setSaving(true)
            setError("")
            const token = localStorage.getItem("token")
            await axios.put(`http://localhost:5000/api/admin/bookings/${booking.id}/status`, { status },
                {headers: {Authorization: `Bearer ${token}`}}
            )

            await getBooking()
        } catch (error) {
            console.log(error)
            setError("Could not update reservation.")
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (date: string) => {
        return date.split("T")[0]
    }

    if (loading) return <p>Loading reservation details...</p>
    if (!booking) return <p>{error || "Reservation not found."}</p>

    return (
        <main className="admin-booking-details-page">
            <h1>Reservation Details</h1>
            <p className="admin-booking-reference">
                Booking reference: #{booking.id}
            </p>

            <div className="admin-booking-summary">
                <div>
                    <p>Guest</p>
                    <h3>{booking.guest_name}</h3>
                </div>
                <div>
                    <p>Hotel</p>
                    <h3>{booking.hotel_name}</h3>
                </div>
                <div>
                    <p>Check-in</p>
                    <h3>{formatDate(booking.check_in)}</h3>
                </div>
                <div>
                    <p>Check-out</p>
                    <h3>{formatDate(booking.check_out)}</h3>
                </div>
            </div>

            <h2>Reservation information</h2>

            <section className="admin-booking-information">
                <div>
                    Room: {booking.room_type} • Rooms: {booking.number_of_rooms}
                    {" • "}Guests: {booking.number_of_guests}
                </div>
                <div>
                    Total: R{booking.total_price}
                </div>
                <div>
                    Status: {booking.status}
                    {" • "}Contact: {booking.guest_email}
                </div>
            </section>
            {error && <p className="admin-booking-error">{error}</p>}
            <div className="admin-booking-detail-actions">
                {booking.status === "pending" && (
                    <>
                        <button onClick={() => updateStatus("confirmed")}disabled={saving} >Approve</button>
                        <button  onClick={() => updateStatus("cancelled")}disabled={saving}>Cancel</button>
                    </>
                )}
                <button onClick={() => navigate("/admin/bookings")}>Back to Reservations</button>
            </div>
        </main>
    )
}

export default AdminBookingDetails
