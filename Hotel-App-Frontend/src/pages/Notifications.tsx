import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Bell, CheckCheck } from "lucide-react"
import { Texts } from "../components/Texts/texts"
import type { Notification } from "../types/hotel"
import "../styles/Notifications.css"

const Notifications = () => {
    const navigate = useNavigate()

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    // Get the logged-in user's notifications
    const getNotifications = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await axios.get("http://localhost:5000/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
            setNotifications(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load notifications.")
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getNotifications()
    }, [])

    // Mark one notification as read
    const markAsRead = async (notificationId: number) => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setError("")
            await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
            setNotifications(notifications.map((notification) =>
                notification.id === notificationId ? { ...notification, is_read: true } : notification
            ))
        }
        catch (error) {
            console.log(error)
            setError("Could not mark notification as read.")
        }
    }

    // Mark all notifications as read
    const markAllAsRead = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setError("")
            await axios.put("http://localhost:5000/api/notifications/read-all", {}, { headers: { Authorization: `Bearer ${token}` } })
            setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))
        }
        catch (error) {
            console.log(error)
            setError("Could not mark all notifications as read.")
        }
    }
    if (loading) {
        return <Texts variant="p">Loading notifications...</Texts>
    }
    return (
        <div className="notifications-container">
            <button type="button" className="notifications-back" onClick={() => navigate("/profile")}>← Back</button>
            <div className="notifications-header">
                <Texts variant="h1">Notifications</Texts>
                {notifications.some((notification) => !notification.is_read) && (
                    <button type="button" className="mark-all-button" onClick={markAllAsRead}><CheckCheck size={18} />Mark all as read</button>
                )}
            </div>
            {error && (
                <Texts variant="p" className="notifications-error">{error}</Texts>
            )}
            {notifications.length === 0 && !error ? (
                <div className="notifications-empty">
                    <Bell size={65} strokeWidth={1.5} />
                    <Texts variant="h2">No notifications yet</Texts>
                    <Texts variant="p">Your booking updates and notifications will appear here.</Texts>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <div key={notification.id} className={`notification-card ${notification.is_read ? "read" : "unread"}`}>
                            <div className="notification-icon"><Bell size={22} /></div>
                            <div className="notification-info">
                                <Texts variant="p">{notification.message}</Texts>
                                <Texts variant="p" className="notification-date">{new Date(notification.created_at).toLocaleString()}</Texts>
                            </div>
                            {!notification.is_read && (
                                <button type="button" className="mark-read-button" onClick={() => markAsRead(notification.id)} title="Mark as read" aria-label="Mark as read"><CheckCheck size={20} /></button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
export default Notifications