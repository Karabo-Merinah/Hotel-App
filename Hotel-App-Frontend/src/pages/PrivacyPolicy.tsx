import { Texts } from "../components/Texts/texts"
import "../styles/InfoPages.css"

const PrivacyPolicy = () => {
    return (
        <div className="info-page">
            <Texts variant="h1">Privacy Policy</Texts>
            <Texts variant="p"> Wander Inn uses personal information to provide   hotel booking and account management features.</Texts>
            <Texts variant="h2">Information You Provide</Texts>
            <Texts variant="p"> The application may collect your name, email address, phone number and booking information.  </Texts>
            <Texts variant="h2">How Information Is Used</Texts>
            <Texts variant="p"> This information supports account management, reservations and booking-related notifications. </Texts>
            <Texts variant="h2">Payments</Texts>
            <Texts variant="p"> Payments are processed through a payment service provider. Payment information is handled according to the provider's processes. </Texts>
        </div>
    )
}

export default PrivacyPolicy
