
import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import "../styles/Navbar.css"

const Navbar = () => {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const token = localStorage.getItem("token")

    const closeMenu = () => {
        setMenuOpen(false)
    }
    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        closeMenu()
        navigate("/login")
    }

    return (
        <>
            <header className="navbar">
                <button type="button" className="navbar-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={25} /> : <Menu size={25} />}</button>

                <NavLink to="/" className="navbar-logo" onClick={closeMenu}> WANDER INN STAYS</NavLink>
                <nav className="navbar-links">
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/favourites">Favourites</NavLink>
                    <NavLink to="/bookings">My Bookings</NavLink>
                    <NavLink to="/profile">Profile</NavLink>
                </nav>
                <div className="navbar-auth">
                    {token ? (
                        <button type="button" onClick={logout}>Logout</button>
                    ) : (
                        <button type="button" onClick={() => navigate("/login")}>Login</button>
                    )}
                </div>
            </header>

            {menuOpen && (
                <>
                    <div className="navbar-overlay" onClick={closeMenu}/>
                    <nav className="navbar-mobile-menu">
                        <button type="button" className="navbar-close-button" onClick={closeMenu} aria-label="Close menu"><X size={24} /></button>
                        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
                        <NavLink to="/favourites" onClick={closeMenu}>Favourites</NavLink>
                        <NavLink to="/bookings" onClick={closeMenu}>My Bookings</NavLink>
                        <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
                        <NavLink to="/notifications" onClick={closeMenu}>Notifications</NavLink>
                        {token ? (
                            <button type="button" onClick={logout}>Logout</button>
                        ) : (
                            <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                        )}
                    </nav>
                </>
            )}
        </>
    )
}

export default Navbar
