import {type  HotelMapProps } from "../types/hotel"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"



const HotelMap = ({ name, address, latitude, longitude }: HotelMapProps) => {
    return (
        <div className="hotel-map">
            <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "350px", width: "100%" }}>
                <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[latitude, longitude]}>
                    <Popup>{name} - {address}</Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}

export default HotelMap
