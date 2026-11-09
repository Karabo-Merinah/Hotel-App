import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../../api/axios"
import { Texts } from "../../components/Texts/texts"
import type { AdminReservation } from "../../types/admin"
import "../../styles/ManageBookings.css"
import Popup from "../../components/Popup"
import ConfirmDialog from "../../components/ConfirmDialog"


const ManageBookings = () => {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<AdminReservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [updatingId, setUpdatingId] = useState<number | null>(null)
    const [popup, setPopup] = useState("")
    const [popupType, setPopupType] = useState<"success" | "error">("success")
    const [confirmBooking, setConfirmBooking] = useState<number | null>(null)

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

    // Cancel an unpaid reservation
    const cancelBooking = async (id: number) => {
        try {
            setUpdatingId(id)
            setError("")
            setPopup("")

            const token = localStorage.getItem("token")
            await api.put(`/api/bookings/${id}/status`,
                { status: "cancelled" }, { headers: { Authorization: `Bearer ${token}` } }
            )
            setBookings(bookings.map((booking) =>
                booking.id === id ? { ...booking, status: "cancelled" } : booking
            ))

            setPopupType("success")
            setPopup("Reservation cancelled successfully.")
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                setPopup(error.response?.data?.message || "Could not cancel reservation.")
            } else {
                setPopup("Could not cancel reservation.")
            }

            setPopupType("error")
        }
        finally {
            setUpdatingId(null)
            setConfirmBooking(null)
        }
    }
    useEffect(() => {
        getBookings()
    }, [])

    useEffect(() => {
        if (!popup) return
        const timer = setTimeout(() => setPopup(""), 3000)
        return () => clearTimeout(timer)
    }, [popup])

    const formatDate = (date: string) => {
        return date.split("T")[0]
    }
    return (
        <div className="manage-bookings">
            {popup && <Popup message={popup} type={popupType} onClose={() => setPopup("")} />}
            {confirmBooking !== null && <ConfirmDialog title="Cancel Reservation" message="Are you sure you want to cancel this reservation?" onConfirm={() => cancelBooking(confirmBooking)} onClose={() => setConfirmBooking(null)} loading={updatingId !== null} />}
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
                                <button onClick={() => navigate(`/admin/bookings/${booking.id}`)}>View Details</button>
                                {booking.status === "pending" && <button className="cancel-booking-button" disabled={updatingId !== null} onClick={() => setConfirmBooking(booking.id)}>Cancel</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ManageBookings
