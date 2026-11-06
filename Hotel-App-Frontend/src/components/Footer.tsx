import { Link } from "react-router-dom"
import "../styles/Footer.css"
import { Texts } from "./Texts/texts"


const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div>
                    <Texts variant="h3">Wander Inn</Texts>
                    <Texts variant="p">Find your perfect stay.</Texts>
                </div>
                <div className="footer-links">
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms & Conditions</Link>
                </div>
            </div>
            <Texts variant="p" className="footer-copyright">2026 Wander Inn </Texts>
        </footer>
    )
}

export default Footer
