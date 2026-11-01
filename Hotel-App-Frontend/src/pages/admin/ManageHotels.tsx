
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import type { Hotel } from "../../types/hotel"
import { Texts } from "../../components/Texts/texts"
import "../../styles/ManageHotels.css"

const ManageHotels = () => {
    const navigate = useNavigate()
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const getHotels = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get("http://localhost:5000/api/hotels")
            setHotels(response.data)
        } catch (error) {
            console.log(error)
            setError("Could not load hotels.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getHotels()
    }, [])

    if (loading) {
        return <p>Loading hotels...</p>
    }

    return (
        <main className="manage-hotels">
            <div className="manage-hotels-header">
                <div>
                    <Texts variant="h1">Accommodations</Texts>
                    <p>Manage Wander Inn hotels and their details.</p>
                </div>
                <button onClick={() => navigate("/admin/hotels/new")}>Add Hotel</button>
            </div>
            {error && <p>{error}</p>}
            {!error && hotels.length === 0 && (
                <p>No hotels found.</p>
            )}
            <div className="manage-hotels-list">
                {hotels.map((hotel) => (
                    <div className="manage-hotel-card" key={hotel.id}>
                        <div className="manage-hotel-info">
                            <h3>{hotel.name}</h3>
                            <p>{hotel.city}</p>
                        </div>
                        <div className="manage-hotel-actions">
                            <button onClick={() => navigate(`/admin/hotels/${hotel.id}/edit`)}>Edit</button>
                            <button onClick={() => navigate(`/admin/hotels/${hotel.id}`)}>View Details </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default ManageHotels
