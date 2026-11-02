
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
        <div className="manage-hotels">
            <div className="manage-hotels-header">
                <div>
                    <Texts variant="h1">Accommodations</Texts>
                    <Texts variant="p">Manage Wander Inn hotels and their details.</Texts>
                </div>
                <button onClick={() => navigate("/admin/hotels/new")}>Add Hotel</button>
            </div>
            {error && <Texts variant="p">{error}</Texts>}
            {!error && hotels.length === 0 && (
                <Texts variant="p">No hotels found.</Texts>
            )}
            <div className="manage-hotels-list">
                {hotels.map((hotel) => (
                    <div className="manage-hotel-card" key={hotel.id}>
                        <div className="manage-hotel-info">
                            <Texts variant="h3">{hotel.name}</Texts>
                            <Texts variant="p">{hotel.city}</Texts>
                        </div>
                        <div className="manage-hotel-actions">
                            <button onClick={() => navigate(`/admin/hotels/${hotel.id}/edit`)}>Edit</button>
                            <button onClick={() => navigate(`/hotels/${hotel.id}`)}>View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManageHotels
