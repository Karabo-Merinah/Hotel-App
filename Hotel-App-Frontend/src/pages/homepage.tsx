import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"
import { Search } from "lucide-react"

interface Hotel {
    id: number,
    name: string,
    description: string,
    address: string,
    city: string,
    star_rating: number
}
const Home = () => {

    const [hotels, setHotels] = useState<Hotel[]>([])
    const [city, setCity] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [guests, setGuests] = useState(1)
    const navigate = useNavigate()

    //get today's date 
    const today = new Date().toLocaleDateString("en-CA")

    const getHotels = async (searchCity: string = "") => {
        try {
            setLoading(true)
            setError("")

            let url = "http://localhost:5000/api/hotels"

            //if the user enter a city add it to the URL 
            if (searchCity !== "") {
                url = `${url}?city=${encodeURIComponent(searchCity)}`
            }
            const response = await axios.get(url)

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

    //search for hotels using the entered city 
    const handleSearch = () => {

        //check that check in is not time in the past 
        if (checkIn && checkIn < today) {
            setError("Check in date cannot be in the past.")
            return
        }
        //check that the check out date is after check in date 
        if (checkIn && checkOut && checkOut <= checkIn) {
            setError("Check-out date must be after check in date.")
            return
        }
        //search hotels by city
        getHotels(city.trim())
    }
    //clear the search and display all hotels
    const clearSearch = () => {
        setCity("")
        setCheckIn("")
        setCheckOut("")
        setGuests(1)
        getHotels()
    }

    return (
        <div className="home-container">
            <div className="home-welcome">
                <Texts variant="h1">Welcome to wander Inn</Texts>
                <Texts variant="p">Find your perfect stays.</Texts>
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
                        <input className="home-guests-input" type="number" min="1" value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))} />
                    </div>
                    <div className="home-search-actions">
                        <button className="home-search-button" onClick={handleSearch}><Search size={20} /></button>
                        <button className="home-clear-button" onClick={clearSearch}>Clear</button>
                    </div>
                </div>
            </div>
            <div className="home-hotels">
                <Texts variant="h2">Our hotel branches</Texts>
                {loading &&
                    <Texts variant="p">Loading hotels ..</Texts>
                }
                {error &&
                    <Texts variant="p">{error}</Texts>
                }
                {!loading && !error && hotels.length === 0 &&
                    <Texts variant="p">No hotels found.</Texts>
                }
                {!loading && !error && hotels.map((hotel) => (
                    <div className="hotel-card" key={hotel.id}>
                        <Texts variant="h3">{hotel.name}</Texts>
                        <Texts variant="p">City: {hotel.city}</Texts>
                        <Texts variant="p">Address:{hotel.address}</Texts>
                        <Texts variant="p">{hotel.description}</Texts>
                        <Texts variant="span">Rating: {hotel.star_rating} Stars</Texts>
                        <div className="hotel-card-actions">
                         <button className="hotel-view-button" onClick={() => navigate(`/hotels/${hotel.id}`, { state: { checkIn, checkOut, guests } })}>View Hotel</button>
                        </div>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home

