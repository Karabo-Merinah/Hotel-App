import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { Heart } from "lucide-react"
import { Texts } from "../components/Texts/texts"
import "../styles/Favourites.css"
import { useDispatch, useSelector } from "react-redux"
import { setFavourites, removeFavourite } from "../features/favouriteSlice"
import type { RootState } from "../app/store"
import Popup from "../components/Popup"
import ConfirmDialog from "../components/ConfirmDialog"


const Favourites = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [removingId, setRemovingId] = useState<number | null>(null)
    const dispatch = useDispatch()
    const [popup, setPopup] = useState("")
    const [popupType, setPopupType] = useState<"success" | "error">("success")
    const [confirmId, setConfirmId] = useState<number | null>(null)


    // Get favourite hotels from Redux
    const favourites = useSelector((state: RootState) => state.favourites)

    const getFavourites = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            setLoading(false)
            navigate("/login", {
                state: { from: "/favourites" }
            })
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await api.get("/api/favourites", { headers: { Authorization: `Bearer ${token}` } })
            // Store the favourite hotels in Redux
            dispatch(setFavourites(response.data))
        }
        catch (error) {
            console.log(error)
            setError("Could not load your favourites.")
        }
        finally {
            setLoading(false)
        }
    }

    // Remove hotel from favourites
    const removingFavourite = async (hotelId: number) => {
        if (removingId !== null) return

        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login", { state: { from: "/favourites" } })
            return
        }

        try {
            setRemovingId(hotelId)
            setError("")
            setPopup("")

            // Remove the favourite from the backend
            await api.delete(`/api/favourites/${hotelId}`, { headers: { Authorization: `Bearer ${token}` } })
            // Update Redux
            dispatch(removeFavourite(hotelId))
            // Close confirmation dialog
            setConfirmId(null)
            // Display success popup
            setPopupType("success")
            setPopup("Hotel removed from favourites successfully.")

        } catch (error) {
            console.log(error)
            setPopupType("error")
            setPopup("Could not remove hotel from favourites.")
            setConfirmId(null)
        } finally {
            setRemovingId(null)
        }
    }

    useEffect(() => {
        getFavourites()
    }, [])

    // Automatically close popup after 3 seconds
    useEffect(() => {
        if (!popup) return
        const timer = setTimeout(() => { setPopup("") }, 3000)
        return () => clearTimeout(timer)
    }, [popup])

    if (loading) {
        return <Texts variant="p">Loading favourites...</Texts>
    }
    return (
        <div className="favourites-container">
            {popup && <Popup message={popup} type={popupType} onClose={() => setPopup("")} />}
            {confirmId !== null && (
                <ConfirmDialog title="Remove Favourite" message="Are you sure you want to remove this hotel from your favourites?" onConfirm={() => removingFavourite(confirmId)} onClose={() => setConfirmId(null)} loading={removingId !== null} />
            )}
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
                                <button type="button" className="remove-favourite" onClick={() => setConfirmId(hotel.id)} disabled={removingId === hotel.id}><Heart size={18} fill="currentColor" />{removingId === hotel.id ? "Removing..." : "Remove"}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Favourites