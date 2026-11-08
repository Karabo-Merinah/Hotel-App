import { type HotelMapProps } from "../types/hotel"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Import the marker images
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Create the marker icon
const icon = L.icon({iconUrl: markerIcon,shadowUrl: markerShadow,iconSize: [25, 41], iconAnchor: [12, 41]
})

const HotelMap = ({ name, address, latitude, longitude }: HotelMapProps) => {
    return (
        <div className="hotel-map">
            {/* Display the map at the hotel's location */}
            <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "350px", width: "100%" }}>
                {/* Display the map background */}
                <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {/* Show the hotel's location marker */}
                <Marker position={[latitude, longitude]} icon={icon}>
                    {/* Show hotel details when the marker is clicked */}
                    <Popup>{name} - {address}</Popup>
                </Marker>

            </MapContainer>
        </div>
    )
}

export default HotelMap
