import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { AdminProfile } from "../../types/admin"
import { Texts } from "../../components/Texts/texts"
import "../../styles/AdminProfile.css"
import { useDispatch } from "react-redux"
import { logout as logoutAction } from "../../features/authSlice"
import ConfirmDialog from "../../components/ConfirmDialog"
import { clearFavourites } from "../../features/favouriteSlice"
import { clearBookings } from "../../features/bookingSlice"


const AdminProfilePage = () => {
    const navigate = useNavigate()
    const [activeSetting, setActiveSetting] = useState("")
    const [confirmLogout, setConfirmLogout] = useState(false)
    const user: AdminProfile | null = JSON.parse(localStorage.getItem("user") || "null")
    const dispatch = useDispatch()

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        dispatch(logoutAction())
        dispatch(clearFavourites())
        dispatch(clearBookings())

        navigate("/login")
    }

    if (!user) {
        return <Texts variant="p">Admin information not found.</Texts>
    }

    return (
        <div className="admin-profile-page">
            {confirmLogout && (
                <ConfirmDialog title="Confirm Logout" message="Are you sure you want to log out of your Wander Inn admin account?" onConfirm={() => {
                    logout()
                    setConfirmLogout(false)
                }} onClose={() => setConfirmLogout(false)} loading={false} />
            )}
            <Texts variant="h1">Admin Profile</Texts>
            <Texts variant="p">Manage administrator account information</Texts>
            <div className="admin-profile-summary">
                <div className="admin-profile-card">
                    <Texts variant="p">Name</Texts>
                    <Texts variant="h3">{user.name}</Texts>
                </div>
                <div className="admin-profile-card">
                    <Texts variant="p">Email</Texts>
                    <Texts variant="h3">{user.email}</Texts>
                </div>
                <div className="admin-profile-card">
                    <Texts variant="p">Role</Texts>
                    <Texts variant="h3">{user.role === "admin" ? "Administrator" : user.role}</Texts>
                </div>
            </div>
            <div className="admin-profile-settings">
                <Texts variant="h2">Account settings</Texts>
                <button type="button" onClick={() => setActiveSetting(activeSetting === "details" ? "" : "details")}>Edit profile details <span>›</span> </button>
                {activeSetting === "details" && (
                    <div className="admin-profile-setting-content">
                        <Texts variant="p">Name: {user.name}</Texts>
                        <Texts variant="p">Email: {user.email}</Texts>
                       
                    </div>
                )}

                <button type="button" onClick={() => setActiveSetting(activeSetting === "security" ? "" : "security")}>Change password <span>›</span> </button>
                {activeSetting === "security" && (
                    <div className="admin-profile-setting-content">
                    </div>
                )}

                <button type="button" onClick={() => setActiveSetting(activeSetting === "notifications" ? "" : "notifications")}>Notification preferences <span>›</span></button>
                {activeSetting === "notifications" && (
                    <div className="admin-profile-setting-content">
                    </div>
                )}
                <button type="button" className="admin-profile-logout" onClick={() => setConfirmLogout(true)}>Sign out <span>›</span></button>
            </div>
        </div>
    )
}

export default AdminProfilePage
