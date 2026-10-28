import type { Hotel } from "../types/hotel"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"

const HotelDetails = () => {

    const { id } = useParams()
    const [hotel, setHotel] = useState<Hotel | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const getHotel = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get( `http://localhost:5000/api/hotels/${id}`)

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
    useEffect(() => {
        getHotel()
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
        </div>
    )
}

export default HotelDetails

