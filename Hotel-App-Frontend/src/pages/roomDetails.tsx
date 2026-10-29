import { useEffect, useState } from "react"
import { useParams, useNavigate,useLocation } from "react-router-dom"
import axios from "axios"
import  type{ Room} from "../types/hotel"
import { Texts } from "../components/Texts/texts"

const RoomDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location=useLocation()
    //gets the search details from home page 
    const {checkIn="",checkOut="",guests=1}=location.state || {}
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
    //checks if the room can accomodate the selected guests 
    const  checkRoomCapacity=()=>{
        if(!room) return 
        if(guests > room.capacity){
            setError(`This room can only accomodate ${room.capacity} guets.`)
            return 
        }
        navigate(`/bookings/new/${room.id}`,{state:{checkIn,checkOut,guests}})
    }

    return (
        <div className="room-details">
            <Texts variant="h1">{room.room_type}</Texts>
            <div className="room-images">
                {room.images && room.images.length >0 ? (
                room.images.map((image)=>(
                    <img key={image.id} src={image.image_url} alt={image.alt_text ||room.room_type}/> ))
                ):(
                    <Texts variant="p">No room images available</Texts>
                )}
            </div>
            <Texts variant="p">{room.description}</Texts>
            <Texts variant="p"> Capacity: {room.capacity} guests</Texts>
            <Texts variant="p">Price: R{room.price_per_night} per night</Texts>
            <Texts variant="p">Total Rooms: {room.total_rooms} </Texts>
            <button onClick={() => navigate(`/hotels/${room.hotel_id}`,{state:{checkIn,checkOut,guests}})}>Back to Hotel</button>
            <button onClick={checkRoomCapacity}>Book Now</button>
        </div>
    )
}

export default RoomDetails