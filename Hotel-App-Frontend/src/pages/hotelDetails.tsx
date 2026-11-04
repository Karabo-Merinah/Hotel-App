import type { Hotel, Room, HotelReviews } from "../types/hotel"
import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import { Heart } from "lucide-react"
import { Share2 } from "lucide-react"
import "../styles/HotelDetails.css"
import HotelMap from "../components/HotelMap"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../app/store"
import { setFavourites, removeFavourite } from "../features/favouriteSlice"

const HotelDetails = () => {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    //getting search details from home page 
    const { checkIn = "", checkOut = "", guests = 1, numberOfRooms = 1 } = location.state || {}

    const [hotel, setHotel] = useState<Hotel | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [rooms, setRooms] = useState<Room[]>([])
    const [hotelReviews, setHotelReviews] = useState<HotelReviews | null>(null)
    const [reviewsError, setReviewsError] = useState("")
    const [roomsLoading, setRoomsLoading] = useState(false)
    const [roomsError, setRoomsError] = useState("")

    const dispatch = useDispatch()
    // Get the user's favourite hotels from Redux
    const favourites = useSelector((state: RootState) => state.favourites)
    // Check if the current hotel is in favourites
    const isFavourite = favourites.some(hotel => hotel.id === Number(id))


    const getHotel = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await api.get(`/api/hotels/${id}`)
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
            setRoomsError("")
            let response
            if (checkIn && checkOut) {
                response = await api.get(`/api/rooms/hotel/${id}`, {
                    params: { checkIn, checkOut, guests, numberOfRooms }
                })
            }
            else {
                response = await api.get(`/api/rooms/hotel/${id}`)
            }
            setRooms(response.data)
        }
        catch (error) {
            console.log(error)
            setRoomsError("Could not load hotel rooms.")
        }
        finally {
            setRoomsLoading(false)
        }
    }
    //checks if the hotel is already saved 
    const checkFavourite = async () => {
        const token = localStorage.getItem("token")
        if (!token || !id) {
            dispatch(setFavourites([]))
            return
        }
        try {
            // Get the updated favourites from the backend
            const response = await api.get("/api/favourites", {
                headers: { Authorization: `Bearer ${token}` }
            })
            // stores favourites in redux
            dispatch(setFavourites(response.data))
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
                await api.delete(`/api/favourites/${id}`, { headers: { Authorization: `Bearer ${token}` } })
                // Remove the hotel from redux
                dispatch(removeFavourite(Number(id)))
            }
            else {
                //ads the hotel to favourites
                await api.post("/api/favourites", { hotel_id: Number(id) }, { headers: { Authorization: `Bearer ${token}` } })

                //fetch updated favourites and store them 
                await checkFavourite()
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

        const hotel_url = `${window.location.origin}/hotels/${hotel.id}`
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

    const getHotelReviews = async () => {
        try {
            setReviewsError("")
            setHotelReviews(null)
            const response = await api.get(`/api/reviews/hotel/${id}`)
            setHotelReviews(response.data)
        }
        catch (error) {
            console.log(error)
            setReviewsError("Could not load hotel reviews.")
        }
    }
    useEffect(() => {
        getHotel()
        getRooms()
        getHotelReviews()
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
            <div className="hotel-images">
                {hotel.images && hotel.images.map((image) => (
                    <img key={image.id} src={image.image_url} alt={hotel.name} />
                ))}
            </div>
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
            <div className="hotel-location">
                <Texts variant="h2">Hotel Location</Texts>
                {hotel.latitude != null && hotel.longitude != null ? (
                    <HotelMap name={hotel.name} address={hotel.address} latitude={parseFloat(String(hotel.latitude))} longitude={parseFloat(String(hotel.longitude))} />
                ) : (
                    <Texts variant="p">Hotel location is not available.</Texts>
                )}
            </div>
            <div className="hotel-rooms">
                <Texts variant="h2">Our Rooms</Texts>
                {roomsError && <Texts variant="p">{roomsError}</Texts>}
                {roomsLoading ? (
                    <Texts variant="p">Loading rooms...</Texts>
                ) : roomsError ? null : rooms.length === 0 ? (
                    <Texts variant="p">No rooms available.</Texts>
                ) : (
                    rooms.map((room) => (
                        <div className="room-card" key={room.id}>
                            <Texts variant="h3">{room.room_type}</Texts>
                            <Texts variant="p">{room.description}</Texts>
                            <Texts variant="p">Capacity: {room.capacity} guests</Texts>
                            <Texts variant="p">Price: R{room.price_per_night} per night</Texts>
                            <button onClick={() => navigate(`/rooms/${room.id}`, { state: { checkIn, checkOut, guests, numberOfRooms } })}>View Room</button>
                        </div>
                    ))
                )}
            </div>
            <div className="hotel-reviews">
                <Texts variant="h2">Guest Reviews</Texts>
                {reviewsError && (
                    <Texts variant="p">{reviewsError}</Texts>
                )}
                {!reviewsError && !hotelReviews && (
                    <Texts variant="p">Loading reviews...</Texts>
                )}

                {hotelReviews && (
                    <>
                        <Texts variant="p"> Average Rating: {hotelReviews.average_rating || 0}/5</Texts>
                        <Texts variant="p">{hotelReviews.reviews_count} reviews</Texts>
                        {hotelReviews.reviews.length === 0 ? (
                            <Texts variant="p">No reviews yet.</Texts>
                        ) : (
                            hotelReviews.reviews.map((review) => (
                                <div className="review-card" key={review.id}>
                                    <Texts variant="h3">{review.reviewer_name} </Texts>
                                    <Texts variant="p">Rating: {review.rating}/5</Texts>
                                    <Texts variant="p">{review.comment}</Texts>
                                    <Texts variant="p"> {new Date(review.created_at).toLocaleDateString()}</Texts>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default HotelDetails

