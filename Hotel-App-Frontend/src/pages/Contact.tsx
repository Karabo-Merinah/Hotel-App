import { Texts } from "../components/Texts/texts"
import "../styles/InfoPages.css"

const Contact = () => {
    return (
        <div className="info-page">
            <Texts variant="h1">Contact Us</Texts>
            <Texts variant="p">Have a question about Wander Inn or need help  with a booking? Contact our support team. </Texts>
            <Texts variant="h2">Customer Support</Texts>
            <Texts variant="p">For booking enquiries, cancellations or account assistance, please use our official support contact details. </Texts>
            <Texts variant="p">Support contact information will be provided here.</Texts>
        </div>
    )
}

export default Contact
