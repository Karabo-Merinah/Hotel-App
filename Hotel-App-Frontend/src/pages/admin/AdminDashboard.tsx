import { useEffect, useState } from "react"
import api from "../../api/axios"
import { Texts } from "../../components/Texts/texts"
import type { DashboardStats } from "../../types/admin"
import "../../styles/AdminDashboard.css"

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const getDashboardStats = async () => {
            try {
                setLoading(true)
                setError("")

                const token = localStorage.getItem("token")
                const response = await api.get("/api/admin/dashboard",
                    {headers: {Authorization: `Bearer ${token}`}}
                )
                setStats(response.data)
            } catch (error) {
                console.log(error)
                setError("Could not load dashboard statistics.")
            } finally {
                setLoading(false)
            }
        }
        getDashboardStats()
    }, [])

    if (loading) {
        return <Texts variant="p">Loading dashboard...</Texts>
    }
    if (error) {
        return <p>{error}</p>
    }
    if (!stats) {
        return <p>No dashboard data found.</p>
    }
    return (
        <div className="admin-dashboard">
            <Texts variant="h1">Dashboard</Texts>
            <Texts variant="p" className="admin-dashboard-description">Overview of hotel performance and reservations</Texts>
            <div className="admin-stats">
                <div className="admin-stat-card">
                    <Texts variant="h3">Total hotels</Texts>
                    <p>{stats.total_hotels}</p>
                </div>
                <div className="admin-stat-card">
                    <Texts variant="h3">Active bookings</Texts>
                    <Texts variant="p">{stats.active_bookings}</Texts>
                </div>
                <div className="admin-stat-card">
                    <Texts variant="h3">Available Rooms Today</Texts>
                    <Texts variant="p">{stats.available_rooms}</Texts>
                </div>
                <div className="admin-stat-card">
                    <Texts variant="h3">Monthly revenue</Texts>
                    <Texts variant="p">R{stats.monthly_revenue.toLocaleString("en-ZA")}</Texts>
                </div>
            </div>
            <div className="admin-recent-reservations">
                <Texts variant="h2">Recent reservations</Texts>
                {stats.recent_bookings.length === 0 ? (
                    <Texts variant="p">No recent reservations found.</Texts>
                ) : (
                    <div className="admin-reservations-list">
                        {stats.recent_bookings.map((booking) => (
                            <div className="admin-reservation" key={booking.id}>
                                <div>
                                    <strong>Reservation #{booking.id}</strong>
                                    <Texts variant="p">Room #{booking.room_id}</Texts>
                                </div>
                                <span className="admin-reservation-status">{booking.status} </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard