import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import { Search } from "lucide-react"
import "../styles/Home.css"
import type { Hotel } from "../types/hotel"
import EmptyHotels from "../components/EmptyHotels"

const Home = () => {

    const [hotels, setHotels] = useState<Hotel[]>([])
    const [city, setCity] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [guests, setGuests] = useState("1")
    const [numberOfRooms, setNumberOfRooms] = useState("1")
    const navigate = useNavigate()

    //get today's date 
    const today = new Date().toLocaleDateString("en-CA")

    const getHotels = async (searchCity: string = "") => {
        try {
            setLoading(true)
            setError("")
            let url = "/api/hotels"
            //if the user enter a city add it to the URL 
            if (searchCity !== "") {
                url = `${url}?city=${encodeURIComponent(searchCity)}`
            }
            const response = await api.get(url)
            //store the hotels that are returned 
            setHotels(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load hotels.Please try again.")
        }
        finally {
            setLoading(false)
        }
    }
    //fetch all hotels when the home page first loads 
    useEffect(() => {
        getHotels()
    }, [])

    const handleSearch = () => {
        // Check if location is empty
        if (city.trim() === "") {
            setError("Please enter a location.")
            return
        }
        // Check if check-in date is empty
        if (checkIn === "") {
            setError("Please select a check-in date.")
            return
        }
        // Check if check-out date is empty
        if (checkOut === "") {
            setError("Please select a check-out date.")
            return
        }
        // Check that check-in is not in the past
        if (checkIn < today) {
            setError("Check-in date cannot be in the past.")
            return
        }
        // Check that check-out is after check-in
        if (checkOut <= checkIn) {
            setError("Check-out date must be after check-in date.")
            return
        }
        // Clear previous errors
        setError("")

        const guestCount = parseInt(guests)
        const roomCount = parseInt(numberOfRooms)
        if (isNaN(guestCount) || guestCount < 1 ||
            isNaN(roomCount) || roomCount < 1) {
            setError("Guests and rooms must be at least 1.")
            return
        }
        // Search hotels by city
        getHotels(city.trim())
    }
    //clear the search and display all hotels
    const clearSearch = () => {
        setCity("")
        setCheckIn("")
        setCheckOut("")
        setGuests("1")
        setNumberOfRooms("1")
        setError("")
        getHotels()
    }
    return (
        <div className="home-container">
        <section className="home-hero">
            <div className="home-hero-heading">
                <Texts variant="h1">Find Your Perfect Stay</Texts>
                <Texts variant="p">Discover comfortable stays at Wander Inn.</Texts>
            </div>
            <div className="home-search">
                <Texts variant="h2">Find a Hotel</Texts>
                <div className="home-search-fields">
                    <div className="search-location">
                        <Texts variant="span">Location</Texts>
                        <input className="home-search-input" type="text" placeholder="Enter city e.g. Polokwane" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="search-check-in">
                        <Texts variant="span">Check-in</Texts>
                        <input className="home-check-in-input" min={today} type="date" value={checkIn} onChange={(e) => {
                            setCheckIn(e.target.value)
                            setCheckOut("")
                        }} />
                    </div>
                    <div className="search-check-out">
                        <Texts variant="span">Check-out</Texts>
                        <input className="home-check-out-input" min={checkIn || today} type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                    </div>
                    <div className="search-guests">
                        <Texts variant="span">Guests</Texts>
                        <input className="home-guests-input" type="number" min="1" value={guests} onChange={(e) => setGuests((e.target.value))} />
                    </div>
                    <div className="search-rooms">
                        <Texts variant="span">Rooms</Texts>
                        <input className="home-rooms-input" type="number" min="1" value={numberOfRooms} onChange={(e) => setNumberOfRooms((e.target.value))} />
                    </div>
                    <div className="home-search-actions">
                        <button className="home-search-button" onClick={handleSearch}><Search size={20} /></button>
                        <button className="home-clear-button" onClick={clearSearch}>Clear</button>
                    </div>
                </div>
                {error && <Texts variant="p">{error}</Texts>}
            </div>
            </section>
            <div className="home-hotels">
                <Texts variant="h2">Our hotel branches</Texts>
                {loading &&
                    <Texts variant="p">Loading hotels ..</Texts>
                }
                {!loading && !error && hotels.length === 0 &&
                    <EmptyHotels />
                }
                {!loading && hotels.map((hotel) => (
                    <div className="hotel-card" key={hotel.id}>
                        {hotel.main_image ? (
                            <img className="hotel-card-image" src={hotel.main_image} alt={hotel.name} />
                        ) : (
                            <div className="hotel-card-no-image">No image available</div>
                        )}

                        <div className="hotel-card-content">
                            <Texts variant="h3">{hotel.name}</Texts>
                            <Texts variant="p">{hotel.city}, {hotel.address}</Texts>
                            <Texts variant="p">{hotel.description}</Texts>
                            <Texts variant="p">Rating: {hotel.star_rating} Stars</Texts>
                            <div className="hotel-card-bottom">
                                <div className="hotel-card-price">
                                    {hotel.price_from !== null && hotel.price_from !== undefined ? (
                                        <Texts variant="p">From R{hotel.price_from} / night</Texts>
                                    ) : (
                                        <Texts variant="p">Price unavailable</Texts>
                                    )}
                                </div>
                                <button className="hotel-view-button" onClick={() => navigate(`/hotels/${hotel.id}`, { state: { checkIn, checkOut, guests: parseInt(guests), numberOfRooms: parseInt(numberOfRooms) } })}>View Hotel</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home

