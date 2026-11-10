import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../api/axios"
import "../styles/ChangePassword.css"

const ChangePassword = () => {
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all fields.")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.")
            return
        }
        const token = localStorage.getItem("token")
        try {
            setLoading(true)
            await api.put("/api/users/me/password",
                {
                    current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            navigate("/profile", {
                state: {
                    popup: "Password changed successfully!"
                }
            })
        }
        catch (error) {
            console.log(error)

            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not change password."
                )
            }
            else {
                setError("Could not change password.")
            }
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="change-password-container">
            <button className="change-password-back" type="button" onClick={() => navigate("/profile")}>  ← Back </button>
            <div className="change-password-card">
                <h1>Change Password</h1>
                <p>Update your Wander Inn account password.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="currentPassword"> Current Password </label>
                    <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
                    <label htmlFor="newPassword"> New Password </label>
                    <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
                    <label htmlFor="confirmPassword"> Confirm New Password</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                    {error && <p className="change-password-error">{error}</p>}
                    <button className="change-password-submit" type="submit" disabled={loading} > {loading ? "Updating..." : "Update Password"} </button>
                </form>
            </div>
        </div>
    )
}

export default ChangePassword