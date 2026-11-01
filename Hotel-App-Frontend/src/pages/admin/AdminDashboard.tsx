import { useEffect, useState } from "react"
import axios from "axios"
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
                const token = localStorage.getItem("token")
                const response = await axios.get( "http://localhost:5000/api/admin/dashboard",
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
        return <p>Loading dashboard...</p>
    }
    if (error) {
        return <p>{error}</p>
    }
    if (!stats) {
        return <p>No dashboard data found.</p>
    }
    return (
        <main className="admin-dashboard">
            <Texts variant="h1">Dashboard</Texts>
            <p className="admin-dashboard-description">Overview of hotel performance and reservations</p>
            <div className="admin-stats">
                <div className="admin-stat-card">
                    <h3>Total hotels</h3>
                    <p>{stats.total_hotels}</p>
                </div>
                <div className="admin-stat-card">
                    <h3>Active bookings</h3>
                    <p>{stats.active_bookings}</p>
                </div>
                <div className="admin-stat-card">
                    <h3>Available rooms</h3>
                    <p>{stats.available_rooms}</p>
                </div>
                <div className="admin-stat-card">
                    <h3>Monthly revenue</h3>
                    <p>R{stats.monthly_revenue.toLocaleString("en-ZA")}</p>
                </div>
            </div>
            <section className="admin-recent-reservations">
                <h2>Recent reservations</h2>
                {stats.recent_bookings.length === 0 ? (
                    <p>No recent reservations found.</p>
                ) : (
                    <div className="admin-reservations-list">
                        {stats.recent_bookings.map((booking) => (
                            <div className="admin-reservation" key={booking.id}>
                                <div>
                                    <strong>Reservation #{booking.id}</strong>
                                    <p>Room #{booking.room_id}</p>
                                </div>
                                <span className="admin-reservation-status">
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

export default AdminDashboard