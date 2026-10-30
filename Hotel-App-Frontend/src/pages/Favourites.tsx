import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Heart } from "lucide-react"
import { Texts } from "../components/Texts/texts"
import "../styles/Favourites.css"
import type { FavouriteHotel } from "../types/hotel"

const Favourites = () => {
    const navigate = useNavigate()
    const [favourites, setFavourites] = useState<FavouriteHotel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [removingId, setRemovingId] = useState<number | null>(null)

    const getFavourites = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await axios.get("http://localhost:5000/api/favourites", { headers: { Authorization: `Bearer ${token}` } })
            setFavourites(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load your favourites.")
        }
        finally {
            setLoading(false)
        }
    }
    const removeFavourite = async (hotelId: number) => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        try {
            setRemovingId(hotelId)
            setError("")
            await axios.delete(`http://localhost:5000/api/favourites/${hotelId}`, { headers: { Authorization: `Bearer ${token}` } })
            setFavourites(favourites.filter((hotel) => hotel.id !== hotelId))
        }
        catch (error) {
            console.log(error)
            setError("Could not remove hotel from favourites.")
        }
        finally {
            setRemovingId(null)
        }
    }
    useEffect(() => {
        getFavourites()
    }, [])
    if (loading) {
        return <Texts variant="p">Loading favourites...</Texts>
    }
    return (
        <div className="favourites-container">
            <button className="favourites-back" type="button" onClick={() => navigate("/profile")}>← Back</button>
            <Texts variant="h1">My Favourites</Texts>
            <Texts variant="p">Hotels you've saved for later.</Texts>
            {error && (
                <Texts variant="p" className="favourites-error">{error}</Texts>
            )}
            {!error && favourites.length === 0 && (
                <div className="favourites-empty">
                    <Heart size={70} strokeWidth={1.5} />
                    <Texts variant="h2">No favourites yet</Texts>
                    <Texts variant="p">Save hotels you love and find them here whenever you're ready to book</Texts>
                    <button type="button" onClick={() => navigate("/")}>Explore Hotels</button>
                </div>
            )}
            {favourites.length > 0 && (
                <div className="favourites-list">
                    {favourites.map((hotel) => (
                        <div className="favourite-card" key={hotel.id}>
                            <div className="favourite-info">
                                <Texts variant="h2">{hotel.name}</Texts>
                                <Texts variant="p">{hotel.city}</Texts>
                                <Texts variant="p">{hotel.address}</Texts>
                                {hotel.price_from !== null && (
                                    <Texts variant="p">From R{Number(hotel.price_from).toFixed(2)} per night</Texts>)}
                                <Texts variant="p">{hotel.star_rating} Star Hotel</Texts>
                            </div>
                            <div className="favourite-actions">
                                <button type="button" onClick={() => navigate(`/hotels/${hotel.id}`)}>View Hotel </button>
                                <button type="button" className="remove-favourite" onClick={() => removeFavourite(hotel.id)} disabled={removingId === hotel.id}><Heart size={18} fill="currentColor" />
                                    {removingId === hotel.id ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Favourites