
import { useNavigate } from "react-router-dom"
import { Texts } from "../../components/Texts/texts"

const AdminDashboard = () => {
    const navigate = useNavigate()

    return (
        <div className="admin-dashboard">
            <Texts variant="h1">Admin Dashboard</Texts>
            <Texts variant="p">Manage Wander Inn hotels, rooms, bookings and reviews.</Texts>
            <div className="admin-dashboard-links">
                <button onClick={() => navigate("/admin/hotels")}>Manage Hotels </button>
                <button onClick={() => navigate("/admin/rooms")}>Manage Rooms</button>
                <button onClick={() => navigate("/admin/bookings")}>Manage Bookings</button>
                <button onClick={() => navigate("/admin/reviews")}> Manage Reviews</button>
            </div>
        </div>
    )
}

export default AdminDashboard
