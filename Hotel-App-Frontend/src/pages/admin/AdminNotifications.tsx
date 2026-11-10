import { useState } from "react"
import api from "../../api/axios"
import "../../styles/AdminNotifications.css"

const AdminNotifications = () => {
    const [message, setMessage] = useState("")
    const [feedback, setFeedback] = useState("")
    const [loading, setLoading] = useState(false)

    const sendNotification = async () => {
        if (!message.trim()) {
            setFeedback("Please enter a notification message.")
            return
        }

        try {
            setLoading(true)
            setFeedback("")

            const token = localStorage.getItem("token")
            const response = await api.post("/api/notifications/admin/send",{ message },
                {headers: { Authorization: `Bearer ${token}` }
                }
            )

            setFeedback(response.data.message)
            setMessage("")
        }
        catch (error) {
            console.log(error)
            setFeedback("Could not send notification.")
        }
        finally {
            setLoading(false)
        }
    }

   return (
    <div className="admin-notifications">
        <h1>Send Notifications</h1>
        <p>Send promotions and announcements to all users.</p>
        <label htmlFor="notification-message">Notification Message</label>
        <div className="notification-form-row">
            <textarea id="notification-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={2} />
            <button type="button" onClick={sendNotification} disabled={loading}>{loading ? "Sending..." : "Send Notification"}</button>
        </div>
        <p>{message.length}/500</p>
        {feedback && <p>{feedback}</p>}
    </div>
)
}
export default AdminNotifications