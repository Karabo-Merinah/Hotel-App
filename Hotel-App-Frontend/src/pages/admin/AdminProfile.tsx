
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { AdminProfile } from "../../types/admin"
import { Texts } from "../../components/Texts/texts"
import "../../styles/AdminProfile.css"

const AdminProfilePage = () => {
    const navigate = useNavigate()
    const [activeSetting, setActiveSetting] = useState("")

    const user: AdminProfile | null = JSON.parse(localStorage.getItem("user") || "null")

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    if (!user) {
        return <Texts variant="p">Admin information not found.</Texts>
    }

    return (
        <div className="admin-profile-page">
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
                        <Texts variant="p">Profile editing will be enabled when the admin profile update endpoint is available.</Texts>
                    </div>
                )}

                <button type="button" onClick={() => setActiveSetting(activeSetting === "security" ? "" : "security")}>Change password <span>›</span> </button>
                {activeSetting === "security" && (
                    <div className="admin-profile-setting-content">
                        <Texts variant="p">Password changes require a secure backend endpoint that verifies your current password.</Texts>
                    </div>
                )}

                <button type="button" onClick={() => setActiveSetting(activeSetting === "notifications" ? "" : "notifications")}>Notification preferences <span>›</span></button>
                {activeSetting === "notifications" && (
                    <div className="admin-profile-setting-content">
                        <Texts variant="p">Notification preferences are not configured yet.</Texts>
                    </div>
                )}
                <button type="button" className="admin-profile-logout" onClick={logout}>Sign out <span>›</span></button>
            </div>
        </div>
    )
}

export default AdminProfilePage
