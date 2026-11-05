
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
import { setFavourites, addFavourite, removeFavourite } from "../features/favouriteSlice"
import Popup from "../components/Popup"
import ConfirmDialog from "../components/ConfirmDialog"
import AmenityIcon from "../components/AmenityIcon"


const HotelDetails = () => {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { checkIn = "", checkOut = "", guests = 1, numberOfRooms = 1 } = location.state || {}
    const [hotel, setHotel] = useState<Hotel | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [rooms, setRooms] = useState<Room[]>([])
    const [hotelReviews, setHotelReviews] = useState<HotelReviews | null>(null)
    const [reviewsError, setReviewsError] = useState("")
    const [roomsLoading, setRoomsLoading] = useState(false)
    const [roomsError, setRoomsError] = useState("")
    const [popup, setPopup] = useState(location.state?.popup || "")
    const [popupType, setPopupType] = useState<"success" | "error">("success")
    const [confirmRemove, setConfirmRemove] = useState(false)
    const [updatingFavourite, setUpdatingFavourite] = useState(false)


    const dispatch = useDispatch()
    // Get the user's favourite hotels from Redux
    const favourites = useSelector((state: RootState) => state.favourites)
    // Check if the current hotel is in favourites
    const isFavourite = favourites.some(hotel => hotel.id === Number(id))

    // Get the selected hotel details from the backend
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

    // Get rooms belonging to the selected hotel
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

    // Check if the hotel is already saved in the user's favourites
    const checkFavourite = async () => {
        const token = localStorage.getItem("token")
        if (!token || !id) {
            dispatch(setFavourites([]))
            return false
        }
        try {
            const response = await api.get("/api/favourites", {
                headers: { Authorization: `Bearer ${token}` }
            })
            dispatch(setFavourites(response.data))
            return true

        } catch (error) {
            console.log(error)
            return false
        }
    }

    // Check favourites when the hotel ID changes
    useEffect(() => {
        checkFavourite()
    }, [id])

    // Add or remove the selected hotel from favourites
    const toggleFavourite = async () => {
        if (updatingFavourite || !id) return

        const token = localStorage.getItem("token")

        // Redirect users to login if they are not authenticated
        if (!token) {
            navigate("/login", { state: { from: location.pathname } })
            return
        }

        try {
            setUpdatingFavourite(true)
            setPopup("")

            if (isFavourite) {
                // Remove hotel from favourites
                await api.delete(`/api/favourites/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                dispatch(removeFavourite(parseInt(id)))
                setPopupType("success")
                setPopup("Hotel removed from favourites successfully.")

            } else {
                // Add hotel to favourites
                await api.post("/api/favourites", { hotel_id: parseInt(id) }, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                // Update Redux immediately
                if (hotel) {
                    dispatch(addFavourite({
                        id: hotel.id, name: hotel.name, city: hotel.city,
                        address: hotel.address, star_rating: hotel.star_rating,
                        latitude: hotel.latitude === null ? null : parseFloat(String(hotel.latitude)), longitude: hotel.longitude === null ? null : parseFloat(String(hotel.longitude)),
                        price_from: null, main_image: hotel.images?.[0]?.image_url || null
                    }))
                }

                setPopupType("success")
                setPopup("Hotel added to favourites successfully.")
            }

        } catch (error) {
            console.log(error)
            setPopupType("error")
            setPopup("Could not update favourites.")

        } finally {
            setUpdatingFavourite(false)
            setConfirmRemove(false)
        }
    }
    // Share the hotel link or copy it to the clipboard
    const shareHotel = async () => {
        if (!hotel) return

        const hotel_url = `${window.location.origin}/hotels/${hotel.id}`
        try {
            if (navigator.share) {
                await navigator.share({ title: hotel.name, text: `Check out ${hotel.name} on Wander Inn! `, url: hotel_url })
            }
            else {
                await navigator.clipboard.writeText(hotel_url)
                setPopupType("success")
                setPopup("Hotel link copied successfully.")
            }
        }
        catch (error) {
            console.log(error)
            setPopupType("error")
            setPopup("Could not share hotel.")
        }
    }
    // Get guest reviews for the selected hotel
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
    // Load hotel details, rooms and reviews
    useEffect(() => {
        getHotel()
        getRooms()
        getHotelReviews()
    }, [id])

    // Automatically close popup messages after 3 seconds
    useEffect(() => {
        if (!popup) return

        const timer = setTimeout(() => {
            setPopup("")
        }, 3000)

        return () => clearTimeout(timer)
    }, [popup])


    // Clear the popup message from navigation state
    useEffect(() => {
        if (location.state?.popup) {
            navigate(location.pathname, {
                replace: true,
                state: { checkIn, checkOut, guests, numberOfRooms }
            })
        }
    }, [location.state, location.pathname, navigate])

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
            {/* Display popup messages and confirmation dialog */}
            {popup && <Popup message={popup} type={popupType} onClose={() => setPopup("")} />}
            {confirmRemove && (
                <ConfirmDialog title="Remove Favourite" message="Are you sure you want to remove this hotel from your favourites?" onConfirm={toggleFavourite} onClose={() => setConfirmRemove(false)} loading={updatingFavourite} />
            )}

            <Texts variant="h1">{hotel.name}</Texts>
            <div className="hotel-images">
                {hotel.images && hotel.images.map((image) => (
                    <img key={image.id} src={image.image_url} alt={hotel.name} />
                ))}
            </div>

            {/* Favourite and share buttons */}
            <div className="hotel-actions">
                <button type="button" className="hotel-favourite-button" onClick={() => isFavourite ? setConfirmRemove(true) : toggleFavourite()} disabled={updatingFavourite} title={isFavourite ? "Remove from Favourites" : "Add to Favourites"} aria-label={isFavourite ? "Remove from Favourites" : "Add to Favourites"}><Heart size={22} fill={isFavourite ? "#c0392b" : "none"} color={isFavourite ? "#c0392b" : "#333"} /></button>
                <button type="button" className="hotel-share-button" onClick={shareHotel} title="Share Accommodation" aria-label="Share Accommodation"><Share2 size={22} /></button>
            </div>
            {/* Hotel description and general information */}
            <Texts variant="p">{hotel.description}</Texts>
            <Texts variant="p">City: {hotel.city}</Texts>
            <Texts variant="p">Address: {hotel.address}</Texts>
            <Texts variant="p">Rating: {hotel.star_rating} Stars</Texts>
            <div className="hotel-amenities">
                <Texts variant="h2">Hotel Amenities</Texts>
                {hotel.amenities && hotel.amenities.length > 0 ? (
                    <div className="hotel-amenities-list">
                        {hotel.amenities.map((amenity) => (
                            <div className="hotel-amenity" key={amenity.id}>
                                <AmenityIcon name={amenity.name} />
                                <span>{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Texts variant="p">No amenities listed.</Texts>
                )}
            </div>

            {/* Display available rooms for the selected hotel */}
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

            {/* Display guest reviews and average hotel rating */}
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

            {/* Display the hotel's location on the map */}
            <div className="hotel-location">
                <Texts variant="h2">Hotel Location</Texts>
                {hotel.latitude != null && hotel.longitude != null ? (
                    <HotelMap name={hotel.name} address={hotel.address} latitude={parseFloat(String(hotel.latitude))} longitude={parseFloat(String(hotel.longitude))} />
                ) : (
                    <Texts variant="p">Hotel location is not available.</Texts>
                )}
            </div>
        </div>
    )
}

export default HotelDetails
