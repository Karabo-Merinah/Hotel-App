import { type HotelMapProps } from "../types/hotel"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "../styles/HotelMap.css"

// Import the marker images
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Create the marker icon
const icon = L.icon({iconUrl: markerIcon,shadowUrl: markerShadow,iconSize: [25, 41], iconAnchor: [12, 41]
})

const HotelMap = ({ name, address, latitude, longitude }: HotelMapProps) => {
    // Create a Google Maps link using the hotel's coordinates
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude}%2C${longitude}`
    return (
        <div className="hotel-map">
            {/* Display the hotel location on the map */}
            <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "350px", width: "100%" }}>
                <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {/* Display the hotel's marker */}
                <Marker position={[latitude, longitude]} icon={icon}>
                    <Popup>{name} - {address}</Popup>
                </Marker>
            </MapContainer>
            {/* Open the hotel location in Google Maps */}
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hotel-google-maps-link">Check place on Google Maps</a>
        </div>
    )
}

export default HotelMap