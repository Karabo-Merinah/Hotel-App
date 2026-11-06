import "../styles/InfoPages.css"
import { Texts } from "../components/Texts/texts"

const About = () => {
    return (
        <div className="info-page">
            <Texts variant="h1">About Wander Inn</Texts>
            <Texts variant="p">Welcome to Wander Inn, a hotel booking platform designed to help guests find and book accommodation with ease.</Texts>
            <Texts variant="h2">What We Offer</Texts>
            <Texts variant="p">Explore hotel branches, view available rooms, compare prices and make reservations online. </Texts>
            <Texts variant="h2">Our Goal</Texts>
            <Texts variant="p">To make finding and booking accommodation simple and convenient. </Texts>
        </div>
    )
}

export default About
