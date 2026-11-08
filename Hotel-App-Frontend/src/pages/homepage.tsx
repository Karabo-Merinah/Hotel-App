
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
    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [guests, setGuests] = useState("1")
    const [numberOfRooms, setNumberOfRooms] = useState("1")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [stars, setStars] = useState("")
    const [amenities, setAmenities] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [searched, setSearched] = useState(false)

    const navigate = useNavigate()
    const today = new Date().toLocaleDateString("en-CA")
    const availableAmenities = ["Wi-Fi", "Parking", "Swimming Pool", "Restaurant", "Air Conditioning"]

    // fetchs hotels from the backend using optional search filters
    const getHotels = async (params = new URLSearchParams()) => {
        try {
            setLoading(true)
            setError("")
            const response = await api.get("/api/hotels", { params })
            setHotels(response.data)
        }
        catch (error) {
            console.log(error)
            setError("Could not load hotels. Please try again.")
        }
        finally {
            setLoading(false)
        }
    }
    // load all hotels when the home page opens
    useEffect(() => {
        getHotels()
    }, [])

    // validate search details and search for matching hotels
    const handleSearch = () => {
        // make sure the user enters a location
        if (city.trim() === "") {
            setError("Please enter a location.")
            return
        }
        // make sure check-in and check-out dates are selected
        if (checkIn === "") {
            setError("Please select a check-in date.")
            return
        }

        if (checkOut === "") {
            setError("Please select a check-out date.")
            return
        }
        // prevents searching with past check-in dates
        if (checkIn < today) {
            setError("Check-in date cannot be in the past.")
            return
        }
        // Make sure check-out is after check-in

        if (checkOut <= checkIn) {
            setError("Check-out date must be after check-in date.")
            return
        }
        // Convert guest and room values to numbers
        const guestCount = parseInt(guests)
        const roomCount = parseInt(numberOfRooms)

        if (isNaN(guestCount) || guestCount < 1 || isNaN(roomCount) || roomCount < 1) {
            setError("Guests and rooms must be at least 1.")
            return
        }

        if (minPrice !== "" && (isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 0)) {
            setError("Enter a valid minimum price.")
            return
        }

        if (maxPrice !== "" && (isNaN(parseFloat(maxPrice)) || parseFloat(maxPrice) < 0)) {
            setError("Enter a valid maximum price.")
            return
        }

        if (minPrice !== "" && maxPrice !== "" && parseFloat(minPrice) > parseFloat(maxPrice)) {
            setError("Minimum price cannot exceed maximum price.")
            return
        }

        const params = new URLSearchParams()
        params.append("city", city.trim())
        params.append("check_in", checkIn)
        params.append("check_out", checkOut)
        params.append("guests", guests)
        params.append("number_of_rooms", numberOfRooms)

        // adds optional filters when selected
        if (minPrice !== "") params.append("minPrice", minPrice)
        if (maxPrice !== "") params.append("maxPrice", maxPrice)
        if (stars !== "") params.append("stars", stars)
        if (amenities.length > 0) params.append("amenities", amenities.join(","))

        setSearched(true)
        getHotels(params)
    }

    const clearSearch = () => {
        setCity("")
        setCheckIn("")
        setCheckOut("")
        setGuests("1")
        setNumberOfRooms("1")
        setMinPrice("")
        setMaxPrice("")
        setStars("")
        setAmenities([])
        setShowFilters(false)
        setSearched(false)
        setError("")
        getHotels()
    }

    // Add or remove an amenity from the selected filters
    const toggleAmenity = (name: string) => {
        if (amenities.includes(name)) {
            setAmenities(amenities.filter(item => item !== name))
        } else {
            setAmenities([...amenities, name])
        }
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
                            <input className="home-check-in-input" min={today} type="date" value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setCheckOut("") }} />
                        </div>
                        <div className="search-check-out">
                            <Texts variant="span">Check-out</Texts>
                            <input className="home-check-out-input" min={checkIn || today} type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                        </div>
                        <div className="search-guests">
                            <Texts variant="span">Guests per room</Texts>
                            <input className="home-guests-input" type="number" min="1" step="1" value={guests} onChange={(e) => setGuests(e.target.value)} />
                        </div>
                        <div className="search-rooms">
                            <Texts variant="span">Rooms</Texts>
                            <input className="home-rooms-input" type="number" min="1" step="1" value={numberOfRooms} onChange={(e) => setNumberOfRooms(e.target.value)} />
                        </div>
                        <div className="home-search-actions">
                            <button className="home-search-button" onClick={handleSearch} disabled={loading}><Search size={18} /> Search</button>
                            <button className="home-clear-button" onClick={clearSearch}>Clear</button>
                        </div>
                    </div>
                    {/* Show or hide additional search filters */}
                    <button type="button" className="home-filter-toggle" onClick={() => setShowFilters(!showFilters)}>{showFilters ? "Hide Filters" : "More Filters"}</button>
                    {showFilters && (
                        <div className="home-extra-filters">
                            <div className="home-filter-field">
                                <label htmlFor="minPrice">Minimum Price (R)</label>
                                <input id="minPrice" type="number" min="0" placeholder="Minimum price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                            </div>
                            <div className="home-filter-field">
                                <label htmlFor="maxPrice">Maximum Price (R)</label>
                                <input id="maxPrice" type="number" min="0" placeholder="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                            </div>
                            <div className="home-filter-field">
                                <label htmlFor="stars">Minimum Star Rating</label>
                                <select id="stars" value={stars} onChange={(e) => setStars(e.target.value)}>
                                    <option value="">Any rating</option>
                                    <option value="1">1 star and above</option>
                                    <option value="2">2 stars and above</option>
                                    <option value="3">3 stars and above</option>
                                    <option value="4">4 stars and above</option>
                                    <option value="5">5 stars</option>
                                </select>
                            </div>
                            <div className="home-amenities-filter">
                                <label>Amenities</label>
                                <div className="home-amenities-options">
                                    {availableAmenities.map(name => (
                                        <label key={name} className="home-amenity-option">
                                            <input type="checkbox" checked={amenities.includes(name)} onChange={() => toggleAmenity(name)} /> {name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {error && <p className="home-search-error">{error}</p>}
                </div>
            </section>
            <div className="home-hotels">
                <Texts variant="h2">{searched ? "Search Results" : "Our hotel branches"}</Texts>
                {loading && <Texts variant="p">Loading hotels...</Texts>}
                {!loading && !error && hotels.length === 0 && <EmptyHotels />}
                {!loading && !error && hotels.map(hotel => (
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
                            {/* Display the average rating from guest reviews */}
                            <Texts variant="p"> {Number(hotel.reviews_count) > 0 ? `Guest Rating: ${hotel.average_rating}/5 (${hotel.reviews_count} reviews)` : "No ratings yet"}</Texts>
                            <div className="hotel-card-bottom">
                                <div className="hotel-card-price">
                                    {hotel.price_from !== null && hotel.price_from !== undefined ? (
                                        <Texts variant="p">From R{hotel.price_from} / night</Texts>
                                    ) : (
                                        <Texts variant="p">Price unavailable</Texts>
                                    )}
                                </div>
                                {/* Navigate to hotel details with the selected booking information */}
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
