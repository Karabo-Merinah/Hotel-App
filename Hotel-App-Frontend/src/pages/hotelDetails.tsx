import type { Hotel, Room } from "../types/hotel"
import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"
import { Heart } from "lucide-react"
import { Share2 } from "lucide-react"
import "../styles/HotelDetails.css"

const HotelDetails = () => {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    //getting search details from home page 
    const { checkIn = "", checkOut = "", guests = 1 } = location.state || {}

    const [hotel, setHotel] = useState<Hotel | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [rooms, setRooms] = useState<Room[]>([])
    const [roomsLoading, setRoomsLoading] = useState(false)
    const [isFavourite, setIsFavourite] = useState(false)

    const getHotel = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`http://localhost:5000/api/hotels/${id}`)
            setHotel(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load hotel details.")
        }
        finally {
            setLoading(false)
        }
    }
    const getRooms = async () => {
        try {
            setRoomsLoading(true)
            const response = await axios.get(`http://localhost:5000/api/rooms/hotel/${id}`)
            setRooms(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load hotel rooms.")
        }
        finally {
            setRoomsLoading(false)
        }
    }
    useEffect(() => {
        getHotel()
        getRooms()
    }, [id])

    //checks if the hotel is already saved 
    const checkFavourite = async () => {
        const token = localStorage.getItem("token")
        if (!token || !id) {
            setIsFavourite(false)
            return
        }
        try {
            const response = await axios.get("http://localhost:5000/api/favourites", { headers: { Authorization: `Bearer ${token}` } })
            const saved = response.data.some((hotel: { id: number }) => hotel.id === Number(id))
            setIsFavourite(saved)
        }
        catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        checkFavourite()
    }, [id])


    //remove the hotel from favourites 
    const toggleFavourite = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        if (!id) return
        try {
            if (isFavourite) {
                await axios.delete(`http://localhost:5000/api/favourites/${id}`, { headers: { Authorization: `Bearer ${token}` } })
                setIsFavourite(false)
            }
            else {
                await axios.post("http://localhost:5000/api/favourites", { hotel_id: Number(id) }, { headers: { Authorization: `Bearer ${token}` } })
                setIsFavourite(true)
            }
        }
        catch (error) {
            console.log(error)
            alert("Could not update favourites.")
        }
    }

    // share button of the accomodation sharing 
    const shareHotel = async () => {
        if (!hotel) return

        const hotel_url = window.location.href

        try {
            if (navigator.share) {
                await navigator.share({ title: hotel.name, text: `Check out ${hotel.name} on Wander Inn! `, url: hotel_url })
            }
            else {
                await navigator.clipboard.writeText(hotel_url)
                alert("Hotel link copied.")
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    if (loading) {
        return <Texts variant="p">Loading hotel details...</Texts>
    }
    if (error) {
        return <Texts variant="p">{error}</Texts>
    }
    if (!hotel) {
        return <Texts variant="p">Hotel not found.</Texts>
    }
    return (
        <div className="hotel-details">
            <Texts variant="h1">{hotel.name}</Texts>
            <div className="hotel-actions">
                <button type="button" className="hotel-favourite-button" onClick={toggleFavourite}
                    title={isFavourite ? "Remove from Favourites" : "Add to Favourites"} aria-label={isFavourite ? "Remove from Favourites" : "Add to Favourites"}>
                    <Heart size={22} fill={isFavourite ? "#c0392b" : "none"} color={isFavourite ? "#c0392b" : "#333"} />
                </button>
                <button type="button" className="hotel-share-button" onClick={shareHotel} title="Share Accommodation" aria-label="Share Accommodation"><Share2 size={22} /></button>
            </div>
            <Texts variant="p">{hotel.description}</Texts>
            <Texts variant="p">City: {hotel.city}</Texts>
            <Texts variant="p">Address: {hotel.address}</Texts>
            <Texts variant="p">Rating: {hotel.star_rating} Stars</Texts>
            <div className="hotel-rooms">
                <Texts variant="h2">Our Rooms</Texts>
                {roomsLoading ? (
                    <Texts variant="p">Loading rooms...</Texts>
                ) : rooms.length === 0 ? (
                    <Texts variant="p">No rooms available.</Texts>
                ) : (
                    rooms.map((room) => (
                        <div className="room-card" key={room.id}>
                            <Texts variant="h3">{room.room_type}</Texts>
                            <Texts variant="p">{room.description}</Texts>
                            <Texts variant="p">Capacity: {room.capacity} guests</Texts>
                            <Texts variant="p">Price: R{room.price_per_night} per night</Texts>
                            <button onClick={() => navigate(`/rooms/${room.id}`, { state: { checkIn, checkOut, guests } })}>View Room</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default HotelDetails

