import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import type { Room } from "../types/hotel"
import { Texts } from "../components/Texts/texts"

const RoomDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const getRoom = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`http://localhost:5000/api/rooms/${id}`)
            setRoom(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load room details.")
        }
        finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getRoom()
    }, [id])

    if (loading) {
        return <Texts variant="p">Loading room details...</Texts>
    }
    if (error) {
        return <Texts variant="p">{error}</Texts>
    }
    if (!room) {
        return <Texts variant="p">Room not found.</Texts>
    }
    return (
        <div className="room-details">
            <Texts variant="h1">{room.room_type}</Texts>
            <Texts variant="p">{room.description}</Texts>
            <Texts variant="p"> Capacity: {room.capacity} guests</Texts>
            <Texts variant="p">Price: R{room.price_per_night} per night</Texts>
            <Texts variant="p">Total Rooms: {room.total_rooms} </Texts>
            <button onClick={() => navigate(`/hotels/${room.hotel_id}`)}>Back to Hotel</button>
            <button onClick={() => navigate(`/bookings/new/${room.id}`)}>Book Now</button>
        </div>
    )
}

export default RoomDetails