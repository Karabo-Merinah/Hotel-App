import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Texts } from "../components/Texts/texts"
import "../styles/Profile.css"

const Profile = () => {
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    // Store original information for discarding changes
    const [originalName, setOriginalName] = useState("")
    const [originalPhone, setOriginalPhone] = useState("")
    // Get the logged-in user's profile
    const getProfile = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await axios.get("http://localhost:5000/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
            setName(response.data.name)
            setEmail(response.data.email)
            setPhone(response.data.phone || "")
            // Save original values
            setOriginalName(response.data.name)
            setOriginalPhone(response.data.phone || "")
        } catch (error) {
            console.log(error)
            setError("Could not load your profile.")
        } finally {
            setLoading(false)
        }
    }
    // Load profile when the page opens
    useEffect(() => {
        getProfile()
    }, [])
    // Enable editing without submitting the form
    const editProfile = () => {
        setError("")
        setSuccess("")
        setEditing(true)
    }
    // Discard changes and restore original values
    const cancelEdit = () => {
        setName(originalName)
        setPhone(originalPhone)
        setEditing(false)
        setError("")
        setSuccess("")
    }

    // Save updated profile information
    const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Prevent updates when editing is disabled
        if (!editing || saving) {
            return
        }
        setError("")
        setSuccess("")
        if (!name.trim()) {
            setError("Name is required.")
            return
        }
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setSaving(true)
            // Only update name and phone; email remains unchanged
            const response = await axios.put(
                "http://localhost:5000/api/users/me", { name: name.trim(), phone }, { headers: { Authorization: `Bearer ${token}` } }
            )
            // Save updated user information
            localStorage.setItem("user", JSON.stringify(response.data))
            // Display updated values
            setName(response.data.name)
            setPhone(response.data.phone || "")
            // Update original values
            setOriginalName(response.data.name)
            setOriginalPhone(response.data.phone || "")
            // Exit editing mode
            setEditing(false)
            // Show success only after saving
            setSuccess("Profile updated successfully.")
        } catch (error) {
            console.log(error)
            setError("Could not update your profile.")
        } finally {
            setSaving(false)
        }
    }

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
            <div className="profile-heading">
                <Texts variant="h1">My Profile</Texts>
                <Texts variant="p">Manage your personal information.</Texts>
            </div>
            <form className="profile-form" onSubmit={updateProfile}>
                <div className="profile-name">
                    <label htmlFor="profile-name">Full Name</label>
                    <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} readOnly={!editing} required />
                </div>
                {/* Email cannot be edited */}
                <div className="profile-email">
                    <label htmlFor="profile-email">Email Address</label>
                    <input id="profile-email" type="email" value={email} readOnly />
                </div>
                <div className="profile-phone">
                    <label htmlFor="profile-phone">Phone Number</label>
                    <input id="profile-phone" type="tel" placeholder="0123456789" value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={!editing} maxLength={20} />
                </div>
                {error && <Texts variant="p" className="profile-error">{error}</Texts>}
                {!editing && success && (
                    <Texts variant="p" className="profile-success">{success}</Texts>
                )}
                {editing && (
                    <div className="profile-edit-buttons">
                        <button className="profile-save-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                        <button className="profile-cancel-button" type="button" onClick={cancelEdit} disabled={saving}>Discard Changes</button>
                    </div>
                )}
            </form>
            {!editing && (
                <div className="profile-view-buttons">
                    <button className="profile-edit-button" type="button" onClick={editProfile}>Edit Profile</button>
                </div>
            )}
            <button className="profile-logout-button" type="button" onClick={logout}>Logout</button>
        </div>
    )
}

export default Profile