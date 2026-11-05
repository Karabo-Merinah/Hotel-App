import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import "../styles/Navbar.css"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../app/store"
import { logout } from "../features/authSlice"
import { clearFavourites } from "../features/favouriteSlice"
import { clearBookings } from "../features/bookingSlice"
import ConfirmDialog from "../components/ConfirmDialog"


const Navbar = () => {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const dispatch = useDispatch()
    const [confirmLogout, setConfirmLogout] = useState(false)

    // Get authentication status from Redux
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

    // Close the mobile navigation menu
    const closeMenu = () => {
        setMenuOpen(false)
    }

    // Log out the user
    const userLogout = () => {

        // remove saved authentication information
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // clear the authentication state in Redux
        dispatch(logout())
        // clear the previous user's favourite hotels
        dispatch(clearFavourites())
        //clears the previous user's bookings 
        dispatch(clearBookings())
        // close the menu and redirect to login
        closeMenu()
        navigate("/login")
    }

    return (
        <>
            <header className="navbar">
                <button type="button" className="navbar-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={25} /> : <Menu size={25} />}</button>
                <NavLink to="/" className="navbar-logo" onClick={closeMenu}> WANDER INN STAYS</NavLink>
                {/* Desktop navigation links */}
                <nav className="navbar-links">
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/favourites">Favourites</NavLink>
                    <NavLink to="/bookings">My Bookings</NavLink>
                    <NavLink to="/profile">Profile</NavLink>
                </nav>
                {/* Display Login or Logout based on Redux authentication */}
                <div className="navbar-auth">
                    {isAuthenticated ? (
                        <button type="button" onClick={() => setConfirmLogout(true)}>Logout</button>
                    ) : (
                        <button type="button" onClick={() => navigate("/login")}>Login</button>
                    )}
                </div>
            </header>
            {/* Mobile navigation menu */}
            {menuOpen && (
                <>
                    <div className="navbar-overlay" onClick={closeMenu} />
                    <nav className="navbar-mobile-menu">
                        <button type="button" className="navbar-close-button" onClick={closeMenu} aria-label="Close menu"><X size={24} /></button>
                        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
                        <NavLink to="/favourites" onClick={closeMenu}>Favourites</NavLink>
                        <NavLink to="/bookings" onClick={closeMenu}>My Bookings</NavLink>
                        <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
                        <NavLink to="/notifications" onClick={closeMenu}>Notifications</NavLink>
                        {/* Display Login or Logout on mobile */}
                        {isAuthenticated ? (
                            <button type="button" onClick={() => setConfirmLogout(true)}>Logout</button>
                        ) : (
                            <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                        )}
                    </nav>
                </>
            )}
            {confirmLogout && (
                <ConfirmDialog title="Confirm Logout" message="Are you sure you want to log out of your Wander Inn account?" onConfirm={() => {
                    userLogout()
                    setConfirmLogout(false)
                }} onClose={() => setConfirmLogout(false)} loading={false} />
            )}
        </>
    )
}

export default Navbar
