import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import api from "../api/axios"
import type { Room } from "../types/hotel"
import { Texts } from "../components/Texts/texts"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "../styles/RoomDetails.css"


const RoomDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    //gets the search details from home page
    const { checkIn = "", checkOut = "", guests = 1, numberOfRooms = 1 } = location.state || {}
    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [availableRooms, setAvailableRooms] = useState<number | null>(null)
    const [checkingAvailability, setCheckingAvailability] = useState(false)
    const [bookingError, setBookingError] = useState("")
    const [currentImage, setCurrentImage] = useState(0)

    // Get the selected room from the backend
    const getRoom = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await api.get(`/api/rooms/${id}`)
            setRoom(response.data)
            setCurrentImage(0)
        }
        catch (error) {
            console.log(error)
            setError("Could not load room details.")
        }
        finally {
            setLoading(false)
        }
    }

    // Checks how many rooms are available for the selected dates
    const checkAvailability = async () => {

        // Stop if the user has not selected check-in and check-out dates
        if (!checkIn || !checkOut) {
            setAvailableRooms(null)
            return
        }
        try {
            // Show loading while checking availability
            setCheckingAvailability(true)
            // Send the room ID and selected dates to the backend
            const response = await api.get(`/api/bookings/rooms/${id}/availability`, {
                params: { check_in: checkIn, check_out: checkOut }
            })
            // Store the number of available rooms returned by the backend
            setAvailableRooms(response.data.available_rooms)
        }
        catch (error) {
            // Handle errors when availability cannot be checked
            console.log(error)
            setAvailableRooms(null)
        }
        finally {
            // Stop loading after the request finishes
            setCheckingAvailability(false)
        }
    }

    useEffect(() => {
        getRoom()
    }, [id])

    useEffect(() => {
        checkAvailability()
    }, [id, checkIn, checkOut])

    // Move to the next room image
    const nextImage = () => {
        if (!room || !room.images || room.images.length === 0) return
        setCurrentImage((currentImage + 1) % room.images.length)
    }

    // Move to the previous room image
    const previousImage = () => {
        if (!room || !room.images || room.images.length === 0) return
        setCurrentImage((currentImage - 1 + room.images.length) % room.images.length)
    }

    if (loading) {
        return <Texts variant="p">Loading room details...</Texts>
    }
    if (error) {
        return <Texts variant="p">{error}</Texts>
    }
    if (!room) {
        return <Texts variant="p">Room not found.</Texts>
    }

    // Checks if the room can accommodate the selected guests
    const checkRoomCapacity = () => {
        if (!room) return
        //clears previous booking errors
        setBookingError("")
        //check if the dates are filled in
        if (!checkIn || !checkOut) {
            setBookingError("Please select check-in and check-out dates first.")
            return
        }
        // Check if the selected rooms can accommodate the guests
        if (guests > room.capacity * numberOfRooms) {
            setBookingError("The selected rooms cannot accommodate all guests.")
            return
        }
        if (availableRooms === null) {
            setBookingError("Could not check room availability. Please try again.")
            return
        }
        //check if enough rooms are available
        if (numberOfRooms > availableRooms) {
            setBookingError("Not enough rooms are available for the selected dates.")
            return
        }
        // Check if the user is logged in
        const token = localStorage.getItem("token")
        // Booking page route
        const bookingPath = `/bookings/new/${room.id}`
        if (!token) {
            // Redirect user to login first
            navigate("/login", { state: { from: bookingPath, checkIn, checkOut, guests, numberOfRooms } })
            return
        }
        // User is logged in, continue to booking
        navigate(bookingPath, { state: { checkIn, checkOut, guests, numberOfRooms } })
    }

    return (
        <div className="room-details">
            <div className="room-details-header">
                <Texts variant="h1">{room.room_type}</Texts>
                <button className="room-back-button" onClick={() => navigate(`/hotels/${room.hotel_id}`, { state: { checkIn, checkOut, guests, numberOfRooms } })}>
                    Back to Hotel
                </button>
            </div>
            <div className="room-details-card">
                {/* Room image gallery */}
                <div className="room-images">
                    {room.images && room.images.length > 0 ? (
                        <>
                            <img src={room.images[currentImage].image_url} alt={room.images[currentImage].alt_text || room.room_type} />
                            {room.images.length > 1 && (
                                <>
                                    <button className="room-image-previous" onClick={previousImage} aria-label="Previous image"><ChevronLeft size={22} /> </button>
                                    <button className="room-image-next" onClick={nextImage} aria-label="Next image"><ChevronRight size={22} /></button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="room-no-image">
                            <Texts variant="p">No room images available</Texts>
                        </div>
                    )}
                </div>
                {/* Room information and booking */}
                <div className="room-information">
                    <div className="room-information-top">
                        <Texts variant="h2">{room.room_type}</Texts>
                        <Texts variant="p">{room.description}</Texts>
                        <Texts variant="p">Capacity: {room.capacity} guests</Texts>
                        <Texts variant="p">Total Rooms: {room.total_rooms}</Texts>
                    </div>
                    <div className="room-information-bottom">
                        <div className="room-booking-details">
                            <div className="room-price">
                                <Texts variant="h2">R{room.price_per_night}</Texts>
                                <Texts variant="p">per night</Texts>
                            </div>
                            {checkingAvailability ? (
                                <Texts variant="p">Checking availability...</Texts>
                            ) : availableRooms !== null ? (
                                <Texts variant="p">Available Rooms: {availableRooms}</Texts>
                            ) : (
                                <Texts variant="p">Select dates to check room availability.</Texts>
                            )}
                        </div>
                        <button className="room-book-button" onClick={checkRoomCapacity} disabled={checkingAvailability || (availableRooms !== null && availableRooms < numberOfRooms)}>
                            {availableRooms !== null && availableRooms < numberOfRooms ? "Not Available" : "Select Room"}
                        </button>
                    </div>
                    {bookingError && (
                        <Texts variant="p">{bookingError}</Texts>
                    )}
                </div>
            </div>
        </div>
    )
}
export default RoomDetails
