import "../styles/HotelMap.css"
import type { HotelMapProps } from "../types/hotel"

const HotelMap = ({ name, address, city }: HotelMapProps) => {
    const location = encodeURIComponent(`${address}, ${city}, South Africa`)

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location}`

    return (
        <div className="hotel-map">
            {/* Display hotel location using its address */}
            <iframe title={`${name} Location`} src={`https://www.google.com/maps?q=${location}&output=embed`}
                width="100%" height="350" style={{ border: 0, borderRadius: "10px" }} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"/>
            {/* Open hotel location in Google Maps */}
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hotel-google-maps-link">Check place on Google Maps</a>
        </div>
    )
}

export default HotelMap
