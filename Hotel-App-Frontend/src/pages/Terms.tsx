import { Texts } from "../components/Texts/texts"
import "../styles/InfoPages.css"

const Terms = () => {
    return (
        <div className="info-page">
            <Texts variant="h1">Terms & Conditions</Texts>
            <Texts variant="h2">Hotel Reservations </Texts>
            <Texts variant="p"> Guests must provide accurate information  when making hotel reservations.</Texts>
            <Texts variant="h2">Room Availability </Texts>
            <Texts variant="p"> Room availability depends on the selected  hotel, room type and booking dates.</Texts>
            <Texts variant="h2">Payments </Texts>
            <Texts variant="p"> Where online payments are available, guests must follow the payment instructions displayed during booking. </Texts>
            <Texts variant="h2">Cancellations </Texts>
            <Texts variant="p"> Guests can view their booking information  and available cancellation options through their accounts. </Texts>
        </div>
    )
}

export default Terms
