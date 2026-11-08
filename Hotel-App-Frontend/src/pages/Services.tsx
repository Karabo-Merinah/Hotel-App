
import { useEffect, useState } from "react"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import { Wifi, Car, Waves, Utensils, Wind, CheckCircle } from "lucide-react"
import "../styles/Services.css"

interface Amenity {
    id: number
    name: string
}

const Services = () => {
    const [amenities, setAmenities] = useState<Amenity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const getAmenities = async () => {
            try {
                const response = await api.get("/api/hotels/amenities/list")
                setAmenities(response.data)
            }
            catch (error) {
                console.log(error)
                setError("Could not load our services.")
            }
            finally {
                setLoading(false)
            }
        }

        getAmenities()
    }, [])

    // Choose an icon based on the amenity name
    const getAmenityIcon = (name: string) => {
        switch (name.toLowerCase()) {
            case "wi-fi":
            case "wifi":
                return <Wifi size={32} />
            case "parking":
                return <Car size={32} />
            case "swimming pool":
                return <Waves size={32} />
            case "restaurant":
                return <Utensils size={32} />
            case "air conditioning":
                return <Wind size={32} />
            default:
                return <CheckCircle size={32} />
        }
    }

    return (
        <div className="services-page">
            {/* Page heading */}
            <div className="services-heading">
                <Texts variant="h1">Services We Offer</Texts>
                <Texts variant="p">Everything you need for a better stay.</Texts>
            </div>
            {/* Display loading and error messages */}
            {loading && <Texts variant="p">Loading services...</Texts>}
            {error && <Texts variant="p">{error}</Texts>}
            {/* Display a message if no amenities exist */}
            {!loading && !error && amenities.length === 0 && (
                <Texts variant="p">No services available yet.</Texts>
            )}
            {/* Display amenities from the database */}
            {!loading && !error && (
                <div className="services-grid">
                    {amenities.map((amenity) => (
                        <div className="service-card" key={amenity.id}>
                            <div className="service-icon">
                                {getAmenityIcon(amenity.name)}
                            </div>
                            <div className="service-info">
                                <Texts variant="h3">{amenity.name}</Texts>
                                <Texts variant="p">
                                    Available at selected Wander Inn branches.
                                </Texts>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Services
