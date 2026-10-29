import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Texts } from "../components/Texts/texts"
import "../styles/Profile.css"

const Profile = () => {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    // Get the logged-in user's information
    const getProfile = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setLoading(true)
            const response = await axios.get("http://localhost:5000/api/users/me", {headers: { Authorization: `Bearer ${token}` }})
            setName(response.data.name)
        } catch (error) {
            console.log(error)
            setError("Could not load your profile.")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getProfile()
    }, [])
    // Log out the user
    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }
    if (loading) {
        return <Texts variant="p">Loading profile...</Texts>
    }
    return (
        <div className="profile-container">
            <button className="profile-back-button" type="button" onClick={() => navigate(-1)}>← Back</button>
            <Texts variant="h1">My Profile</Texts>
            {error && <Texts variant="p" className="profile-error">{error}</Texts>}
            <div className="profile-card">
                <div className="profile-avatar">{name.charAt(0).toUpperCase()}</div>
                <div className="profile-user-info">
                    <Texts variant="h2">{name}</Texts>
                    <Texts variant="p">Manage your personal information</Texts>
                </div>
                <button className="profile-edit-button" type="button" onClick={() => navigate("/profile/edit")}>Edit Profile</button>
            </div>
            {/* Account settings */}
            <div className="profile-settings">
                <Texts variant="h2">Account settings</Texts>
                <button className="profile-settings-item" type="button" onClick={() => navigate("/profile/edit")}>Personal information  <span>›</span></button>
                <button className="profile-settings-item" type="button" onClick={() => navigate("/bookings")}>My booking <span>›</span></button>
                <button className="profile-settings-item" type="button" onClick={() => navigate("/favourites")}> Favourites<span>›</span></button>
                <button className="profile-settings-item" type="button" onClick={() => navigate("/notifications")}>Notifications<span>›</span></button>
            </div>
            <button className="profile-logout-button" type="button" onClick={logout}>Logout</button>
        </div>
    )
}

export default Profile