import type { Hotel, Room } from "../types/hotel"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"

const HotelDetails = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const [hotel, setHotel] = useState<Hotel | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [rooms, setRooms] = useState<Room[]>([])
    const [roomsLoading, setRoomsLoading] = useState(false)

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
                            <button onClick={() => navigate(`/rooms/${room.id}`)}>View Room</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default HotelDetails

