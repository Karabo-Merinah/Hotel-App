import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import "../styles/AdminNavbar.css"
import { useDispatch } from "react-redux"
import { logout as logoutUser } from "../features/authSlice"
import { clearFavourites } from "../features/favouriteSlice"
import { clearBookings } from "../features/bookingSlice"
import ConfirmDialog from "../components/ConfirmDialog"
import logo from "../assets/wander_inn_logo.png"
import { ExternalLink } from "lucide-react"

const AdminNavbar = () => {
    const navigate = useNavigate()
    const [confirmLogout, setConfirmLogout] = useState(false)
    const dispatch = useDispatch()

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        dispatch(logoutUser())
        dispatch(clearFavourites())
        dispatch(clearBookings())
        navigate("/login")
    }


    return (
        <>
            <div className="admin-sidebar">
                <div className="admin-logo">
                    <img src={logo} alt="Wander Inn Logo" className="admin-logo-image" />
                    <span className="admin-panel-label">ADMIN PANEL</span>
                </div>
                {/* admin navigation links */}
                <div className="admin-navbar-links">
                    <NavLink to="/admin" end>Dashboard</NavLink>
                    <NavLink to="/admin/hotels">Accommodations</NavLink>
                    <NavLink to="/admin/hotels/new">Add Hotel</NavLink>
                    <NavLink to="/admin/bookings">Reservations</NavLink>
                    <NavLink to="/admin/rooms">Room & Pricing</NavLink>
                    <NavLink to="/admin/reviews">Reviews</NavLink>
                    <NavLink to="/admin/notifications">Notifications</NavLink>
                    <NavLink to="/admin/profile">Admin Profile</NavLink>
                    {/* open the user website in a new tab so admin can see changes. */}
                    <a href="/" target="_blank" rel="noopener noreferrer" className="admin-view-website"> <ExternalLink size={16} /> View Website</a>
                </div>
                {/* logout button */}
                <button type="button" className="admin-desktop-logout" onClick={() => setConfirmLogout(true)}> Logout</button>
            </div>
            {/* confirmation before logging out */}
            {confirmLogout && (
                <ConfirmDialog title="Confirm Logout" message="Are you sure you want to log out of your Wander Inn admin account?" onConfirm={() => {
                    logout()
                    setConfirmLogout(false)
                }} onClose={() => setConfirmLogout(false)} loading={false} />
            )}
        </>
    )

}

export default AdminNavbar
