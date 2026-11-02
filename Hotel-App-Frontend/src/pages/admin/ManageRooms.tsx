import { useEffect, useState } from "react"
import axios from "axios"
import type { Hotel } from "../../types/hotel"
import type { AdminRoom } from "../../types/admin"
import "../../styles/ManageRooms.css"
import { Texts } from "../../components/Texts/texts"


    const ManageRooms = () => {
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [rooms, setRooms] = useState<AdminRoom[]>([])
    const [hotelId, setHotelId] = useState("")
    const [roomId, setRoomId] = useState("")
    const [roomType, setRoomType] = useState("")
    const [description, setDescription] = useState("")
    const [capacity, setCapacity] = useState("")
    const [totalRooms, setTotalRooms] = useState("")
    const [price, setPrice] = useState("")
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const token = localStorage.getItem("token")

    const clearForm = () => {
        setRoomId("")
        setRoomType("")
        setDescription("")
        setCapacity("")
        setTotalRooms("")
        setPrice("")
        setIsActive(true)
    }

    const getHotels = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/hotels")
            setHotels(response.data)
        } catch (error) {
            console.log(error)
            setError("Could not load hotels.")
        }
    }

    const getRooms = async (id: string) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/rooms/hotel/${id}`)
            setRooms(response.data)
        } catch (error) {
            console.log(error)
            setError("Could not load rooms.")
        }
    }

    useEffect(() => {
        getHotels()
    }, [])

    const selectHotel = (id: string) => {
        setHotelId(id)
        setRooms([])
        clearForm()
        setError("")
        setMessage("")

        if (id) {
            getRooms(id)
        }
    }

    const selectRoom = (id: string) => {
        setRoomId(id)
        setError("")
        setMessage("")

        if (!id) {
            clearForm()
            return
        }

        const room = rooms.find((room) => room.id === parseInt(id))

        if (room) {
            setRoomType(room.room_type)
            setDescription(room.description || "")
            setCapacity(String(room.capacity))
            setTotalRooms(String(room.total_rooms))
            setPrice(String(room.price_per_night))
            setIsActive(room.is_active)
        }
    }

    const saveRoom = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!hotelId) {
            setError("Please select a hotel.")
            return
        }

        setLoading(true)
        setError("")
        setMessage("")

        const roomData = {
            hotel_id: parseInt(hotelId),
            room_type: roomType,
            description,
            capacity: parseInt(capacity),
            total_rooms: parseInt(totalRooms),
            price_per_night: parseFloat(price),
            is_active: isActive
        }

        try {
            if (roomId) {
                await axios.put(`http://localhost:5000/api/rooms/${roomId}`, roomData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } else {
                await axios.post("http://localhost:5000/api/rooms", roomData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }

            setMessage("Room saved successfully.")
            clearForm()
            await getRooms(hotelId)
        } catch (error) {
            console.log(error)
            setError("Could not save room.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-room-page">
            <Texts variant="h1">Room & Pricing</Texts>
            <form className="admin-room-form" onSubmit={saveRoom}>
                <div className="admin-room-field">
                    <label htmlFor="admin-hotel">Select hotel</label>
                    <select id="admin-hotel" value={hotelId} onChange={(e) => selectHotel(e.target.value)} required>
                        <option value="">Select accommodation</option>
                        {hotels.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                        ))}
                    </select>
                </div>

                <div className="admin-room-field">
                    <label htmlFor="admin-room">Select room</label>
                    <select id="admin-room" value={roomId} onChange={(e) => selectRoom(e.target.value)} disabled={!hotelId}>
                        <option value="">Add new room type</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>{room.room_type}</option>
                        ))}
                    </select>
                </div>
                <div className="admin-room-field">
                    <label htmlFor="admin-room-type">Room type</label>
                    <input id="admin-room-type" type="text" value={roomType} onChange={(e) => setRoomType(e.target.value)} required />
                </div>
                <div className="admin-room-field">
                    <label htmlFor="admin-room-capacity">Maximum guests</label>
                    <input id="admin-room-capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                </div>
                <div className="admin-room-field">
                    <label htmlFor="admin-room-total">Total rooms</label>
                    <input id="admin-room-total" type="number" min="0" value={totalRooms} onChange={(e) => setTotalRooms(e.target.value)} required />
                </div>
                <div className="admin-room-field">
                    <label htmlFor="admin-room-price">Price per night (R)</label>
                    <input id="admin-room-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="admin-room-field admin-room-description">
                    <label htmlFor="admin-room-description">Description</label>
                    <textarea id="admin-room-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="admin-room-active">
                    <input id="admin-room-active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    <label htmlFor="admin-room-active">Room type is active</label>
                </div>
                <div className="admin-room-actions">
                    <button type="submit" disabled={loading}>{loading ? "Saving..." : roomId ? "Save updates" : "Add room"}</button>
                </div>
            </form>
            {error && <Texts variant="p">{error}</Texts>}
            {message && <Texts variant="p">{message}</Texts>}
        </div>
    )
}

export default ManageRooms
