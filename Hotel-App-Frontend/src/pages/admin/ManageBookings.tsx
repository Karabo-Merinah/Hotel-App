
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import type { AdminReservation } from "../../types/admin"
import "../../styles/ManageBookings.css"

const ManageBookings = () => {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<AdminReservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const getBookings = async () => {
        try {
            setLoading(true)
            setError("")
            const token = localStorage.getItem("token")
            const response = await axios.get("http://localhost:5000/api/admin/bookings",
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setBookings(response.data)
        } catch (error) {
            console.log(error)
            setError("Could not load reservations.")
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: number, status: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to ${status === "confirmed" ? "approve" : "cancel"} this reservation?`
        )
        if (!confirmed) return
        try {
            setError("")
            const token = localStorage.getItem("token")

            await axios.put(`http://localhost:5000/api/admin/bookings/${id}/status`, { status },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            await getBookings()
        } catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not update reservation.")
            } else {
                setError("Could not update reservation.")
            }
        }
    }
    useEffect(() => {
        getBookings()
    }, [])
    const formatDate = (date: string) => {
        return date.split("T")[0]
    }
    return (
        <div className="manage-bookings">
            <h1>Reservations</h1>
            {loading && <p>Loading reservations...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && bookings.length === 0 && (
                <p>No reservations found.</p>
            )}
            {!loading && bookings.length > 0 && (
                <div className="admin-bookings-list">
                    {bookings.map((booking) => (
                        <div className="admin-booking-card" key={booking.id}>
                            <div className="admin-booking-details">
                                <h3>{booking.guest_name}</h3>
                                <p>{booking.hotel_name} / {booking.room_type}</p>
                                <p>Check-in: {formatDate(booking.check_in)}</p>
                                <p>Check-out: {formatDate(booking.check_out)}</p>
                                <p>{booking.number_of_guests} guests</p>
                                <p>Status: <strong>{booking.status}</strong></p>
                            </div>
                            <div className="admin-booking-actions">
                                {booking.status === "pending" && (
                                    <button onClick={() => updateStatus(booking.id, "confirmed")}>Approve</button>
                                )}
                                <button onClick={() => navigate(`/admin/bookings/${booking.id}`)}>View Details</button>
                                {booking.status === "pending" && (
                                    <button onClick={() => updateStatus(booking.id, "cancelled")}>Cancel</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ManageBookings
