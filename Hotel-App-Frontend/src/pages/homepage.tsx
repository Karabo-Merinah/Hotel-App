import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"

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
    const navigate = useNavigate()

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
        getHotels(city.trim())
    }

    //clear the search and display all hotels
    const clearSearch = () => {
        setCity("")
        getHotels()
    }

    return (
        <div className="home-container">
            <div className="home-welcome">
                <Texts variant="h1">Welcome to wander Inn</Texts>
                <Texts variant="p">find your perfect stays.</Texts>
            </div>
            <div className="home-search">
                <Texts variant="h2">Find a hotel</Texts>
                <input className="home-search-input" type="text" placeholder="Enter city e.g Polokwane" value={city} onChange={(e) => setCity(e.target.value)} />
                <button className="home-search-button" onClick={handleSearch}><search></search></button>
                <button className="home-clear-button" onClick={clearSearch}>Clear</button>
            </div>
            <div className="home-hotels">
                <Texts variant="h2">Our hotel branches</Texts>
                {loading &&
                    <Texts variant="p">Loading hotels ..</Texts>
                }
                {error &&
                    <Texts variant="p">{error}</Texts>
                }
                {!loading && !error && hotels.map((hotel) => (
                    <div className="hotel-card" key={hotel.id}>
                        <Texts variant="h3">{hotel.name}</Texts>
                        <Texts variant="p">City: {hotel.city}</Texts>
                        <Texts variant="p">Address:{hotel.address}</Texts>
                        <Texts variant="p">{hotel.description}</Texts>
                        <Texts variant="span">Rating: {hotel.star_rating} Stars</Texts>
                        <div className="hotel-card-actions">
                        <button className="hotel-view-button" onClick={() => navigate(`/hotels/${hotel.id}`)}>View Hotel</button>
                        </div>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home

