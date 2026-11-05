import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import axios from "axios"
import api from "../api/axios"
import { useNavigate } from "react-router-dom"
import { Texts } from "../components/Texts/texts"
import "../styles/EditProfile.css"
import Popup from "../components/Popup"


const EditProfile = () => {
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [originalName, setOriginalName] = useState("")
    const [originalPhone, setOriginalPhone] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [popup, setPopup] = useState("")


    // Load the user's current information
    const getProfile = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            setLoading(false)
            navigate("/login", {
                state: { from: "/profile/edit" }
            })
            return
        }
        try {
            setLoading(true)
            setError("")

            const response = await api.get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
            setName(response.data.name)
            setEmail(response.data.email)
            setPhone(response.data.phone || "")
            setOriginalName(response.data.name)
            setOriginalPhone(response.data.phone || "")
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

    // Save updated profile information
    const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

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
            const response = await api.put("/api/users/me", { name: name.trim(), phone }, { headers: { Authorization: `Bearer ${token}` } })
            localStorage.setItem("user", JSON.stringify(response.data))
            // Navigate to Profile and pass the success message
            navigate("/profile", { state: { popup: "Profile updated successfully!" } })

        } catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not update your profile.")
                setPopup(error.response?.data?.message || "Could not update your profile.")
            } else {
                setError("Could not update your profile.")
                setPopup("Could not update your profile.")
            }
        } finally {
            setSaving(false)
        }
    }

    // Discard unsaved changes
    const cancelEdit = () => {
        setName(originalName)
        setPhone(originalPhone)
        navigate("/profile")
    }
    if (loading) {
        return <Texts variant="p">Loading profile...</Texts>
    }
    return (
        <div className="edit-profile-container">
            {popup && <Popup message={popup} type="error" onClose={() => setPopup("")} />}
            <button className="edit-profile-back-button" type="button" onClick={() => navigate("/profile")}>← Back</button>
            <div className="edit-profile-heading">
                <Texts variant="h1">Edit Profile</Texts>
                <Texts variant="p">Update your personal information.</Texts>
            </div>
            <form className="edit-profile-form" onSubmit={updateProfile}>
                <div className="edit-profile-name">
                    <label htmlFor="edit-profile-name">Full Name</label>
                    <input id="edit-profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="edit-profile-email">
                    <label htmlFor="edit-profile-email">Email Address</label>
                    <input id="edit-profile-email" type="email" value={email} readOnly />
                </div>
                <div className="edit-profile-phone">
                    <label htmlFor="edit-profile-phone">Phone Number</label>
                    <input id="edit-profile-phone" type="tel" placeholder="0821234567" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} />
                </div>
                {error && <Texts variant="p" className="edit-profile-error">{error}</Texts>}
                <div className="edit-profile-buttons">
                    <button className="edit-profile-cancel-button" type="button" onClick={cancelEdit} disabled={saving}>Discard Changes</button>
                    <button className="edit-profile-save-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
            </form>
        </div>
    )
}
export default EditProfile