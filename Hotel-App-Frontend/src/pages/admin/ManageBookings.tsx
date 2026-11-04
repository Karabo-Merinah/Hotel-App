import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../../api/axios"
import { Texts } from "../../components/Texts/texts"
import type { AdminReservation } from "../../types/admin"
import "../../styles/ManageBookings.css"

const ManageBookings = () => {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<AdminReservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [updatingId, setUpdatingId] = useState<number | null>(null)

    const getBookings = async () => {
        try {
            setLoading(true)
            setError("")
            const token = localStorage.getItem("token")
            const response = await api.get("/api/admin/bookings",
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
            setUpdatingId(id)
            setError("")

            const token = localStorage.getItem("token")
            await api.put(`/api/admin/bookings/${id}/status`, { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
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
        finally {
            setUpdatingId(null)
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
            <Texts variant="h1">Reservations</Texts>
            {loading && <p>Loading reservations...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && bookings.length === 0 && (
                <Texts variant="p">No reservations found.</Texts>
            )}
            {!loading && bookings.length > 0 && (
                <div className="admin-bookings-list">
                    {bookings.map((booking) => (
                        <div className="admin-booking-card" key={booking.id}>
                            <div className="admin-booking-details">
                                <Texts variant="h3">{booking.guest_name}</Texts>
                                <Texts variant="p">{booking.hotel_name} / {booking.room_type}</Texts>
                                <Texts variant="p">Check-in: {formatDate(booking.check_in)}</Texts>
                                <Texts variant="p">Check-out: {formatDate(booking.check_out)}</Texts>
                                <Texts variant="p">{booking.number_of_guests} guests</Texts>
                                <Texts variant="p">Status: <strong>{booking.status}</strong></Texts>
                            </div>
                            <div className="admin-booking-actions">
                                {booking.status === "pending" && (
                                    <button disabled={updatingId === booking.id} onClick={() => updateStatus(booking.id, "confirmed")}> {updatingId === booking.id ? "Updating..." : "Approve"}
                                    </button>
                                )}
                                <button onClick={() => navigate(`/admin/bookings/${booking.id}`)}>View Details</button>
                                {booking.status === "pending" && (
                                    <button disabled={updatingId === booking.id} onClick={() => updateStatus(booking.id, "cancelled")}> Cancel
                                    </button>
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
