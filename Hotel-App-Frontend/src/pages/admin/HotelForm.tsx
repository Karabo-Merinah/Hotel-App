
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import "../../styles/HotelForm.css"

const HotelForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [starRating, setStarRating] = useState("3")
    const [policies, setPolicies] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!id) return

        const getHotel = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/hotels/${id}`
                )
                const hotel = response.data
                setName(hotel.name || "")
                setDescription(hotel.description || "")
                setAddress(hotel.address || "")
                setCity(hotel.city || "")
                setLatitude(String(hotel.latitude || ""))
                setLongitude(String(hotel.longitude || ""))
                setStarRating(String(hotel.star_rating || 3))
                setPolicies(hotel.policies || "")
            } catch (error) {
                console.log(error)
                setError("Could not load hotel details.")
            }
        }

        getHotel()
    }, [id])

    const saveHotel = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const token = localStorage.getItem("token")

        const hotelData = {
            name, description, address, city,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            star_rating: parseInt(starRating),
            policies
        }

        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/hotels/${id}`, hotelData, {
                    headers: { Authorization: `Bearer ${token}` }
                }
                )
            } else {
                await axios.post("http://localhost:5000/api/hotels", hotelData, { headers: { Authorization: `Bearer ${token}` } }
                )
            }
            navigate("/admin/hotels")
        } catch (error) {
            console.log(error)
            setError("Could not save hotel.")
        } finally {
            setLoading(false)
        }
    }
    return (
        <main className="admin-hotel-form-page">
            <div className="admin-hotel-form-header">
                <h1>{id ? "Edit Hotel" : "Add Hotel"}</h1>
                <p>Manage accommodation details and information.</p>
            </div>
            <form className="admin-hotel-form" onSubmit={saveHotel}>
                <h2>Hotel Information</h2>
                <label htmlFor="hotel-name">Hotel Name</label>
                <input id="hotel-name" value={name} onChange={(e) => setName(e.target.value)} required />
                <label htmlFor="hotel-description">Description</label>
                <textarea id="hotel-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                <label htmlFor="hotel-address">Address</label>
                <input id="hotel-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                <label htmlFor="hotel-city">City</label>
                <input id="hotel-city" value={city} onChange={(e) => setCity(e.target.value)} required />
                <div className="admin-hotel-form-row">
                    <div>
                        <label htmlFor="hotel-latitude">Latitude</label>
                        <input id="hotel-latitude" type="number" step="any" min="-90" max="90" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="hotel-longitude">Longitude</label>
                        <input id="hotel-longitude" type="number" step="any" min="-180" max="180" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                    </div>
                </div>
                <label htmlFor="hotel-rating">Star Rating</label>
                <select id="hotel-rating" value={starRating} onChange={(e) => setStarRating(e.target.value)}>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                </select>
                <label htmlFor="hotel-policies">Hotel Policies</label>
                <textarea id="hotel-policies" value={policies} onChange={(e) => setPolicies(e.target.value)} rows={4} />
                <div className="admin-hotel-form-actions">
                    <button type="button" className="admin-hotel-cancel" onClick={() => navigate("/admin/hotels")}>Cancel</button>
                    <button type="submit" disabled={loading}>{loading ? "Saving..." : id ? "Save Changes" : "Add Hotel"}</button>
                </div>
                {error && <p className="admin-hotel-error">{error}</p>}
            </form>
        </main>
    )
}

export default HotelForm
