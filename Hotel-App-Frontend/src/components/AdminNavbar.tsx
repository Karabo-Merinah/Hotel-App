import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import "../styles/AdminNavbar.css"
import { useDispatch } from "react-redux"
import { logout as logoutUser } from "../features/authSlice"
import { clearFavourites } from "../features/favouriteSlice"
import { clearBookings } from "../features/bookingSlice"
import ConfirmDialog from "../components/ConfirmDialog"


const AdminNavbar = () => {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [confirmLogout, setConfirmLogout] = useState(false)
    const dispatch = useDispatch()


    const closeMenu = () => {
        setMenuOpen(false)
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        dispatch(logoutUser())
        dispatch(clearFavourites())
        dispatch(clearBookings())

        closeMenu()
        navigate("/login")
    }
    return (
        <>
            <header className="admin-navbar">
                <button className="admin-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={25} /></button>
                <NavLink to="/admin" className="admin-logo">WANDER INN <span className="admin-panel-label">| ADMIN PANEL</span>
                    <span className="admin-mobile-label">| ADMIN</span>
                </NavLink>
                <nav className="admin-navbar-links">
                    <NavLink to="/admin" end>Dashboard</NavLink>
                    <NavLink to="/admin/hotels">Accommodations</NavLink>
                    <NavLink to="/admin/hotels/new">Add  Hotel</NavLink>
                    <NavLink to="/admin/bookings">Reservations</NavLink>
                    <NavLink to="/admin/rooms">Room & Pricing</NavLink>
                    <NavLink to="/admin/profile">Admin Profile</NavLink>
                    <button type="button" className="admin-desktop-logout" onClick={() => setConfirmLogout(true)}>Logout</button>
                </nav>
            </header>

            {menuOpen && (
                <>
                    <div className="admin-overlay" onClick={closeMenu}></div>
                    <nav className="admin-mobile-menu">
                        <h3>WANDER INN | ADMIN</h3>
                        <button className="admin-close-button" onClick={closeMenu} ><X size={18} /> Close</button>
                        <h4>MENU</h4>
                        <NavLink to="/admin" end onClick={closeMenu}>Dashboard <span>›</span></NavLink>
                        <NavLink to="/admin/hotels" onClick={closeMenu}>Accommodations <span>›</span></NavLink>
                        <NavLink to="/admin/hotels/new" onClick={closeMenu}>Add / Edit Hotel <span>›</span></NavLink>
                        <NavLink to="/admin/bookings" onClick={closeMenu}>Reservations <span>›</span></NavLink>
                        <NavLink to="/admin/rooms" onClick={closeMenu}>Room & Pricing <span>›</span></NavLink>
                        <NavLink to="/admin/profile" onClick={closeMenu}>Admin Profile <span>›</span></NavLink>
                        <button className="admin-mobile-logout" type="button" onClick={() => setConfirmLogout(true)}>Logout</button>
                    </nav>
                </>
            )}
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
