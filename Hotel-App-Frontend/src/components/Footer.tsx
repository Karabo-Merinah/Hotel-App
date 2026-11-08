import { Link } from "react-router-dom"
import { FaInstagram, FaFacebook } from "react-icons/fa"
import { Mail, Phone } from "lucide-react"
import "../styles/Footer.css"
import { Texts } from "./Texts/texts"

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <Texts variant="h3">Wander Inn</Texts>
                    <Texts variant="p">Find your perfect stay.</Texts>
                </div>
                {/* Social media and contact information */}
                <div className="footer-contact">
                    <Texts variant="h3">Connect With Us</Texts>
                    {/* Social media icons */}
                    <div className="footer-social-icons">
                        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook size={18} /> </a>
                        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram size={18} /> </a>
                        <a href="mailto:hello@wanderinn.example" aria-label="Email"><Mail size={18} /></a>
                    </div>
                    {/* Contact information */}
                    <p ><Phone size={16} /> (012) 5689 909</p>
                </div>
                {/* Footer navigation */}
                <div className="footer-links">
                    <Link to="/services">Services We Offer</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms & Conditions</Link>
                </div>
            </div>
            <div className="footer-bottom">
                <Texts variant="p">© 2026 Wander Inn. All rights reserved.</Texts>
            </div>
        </footer>
    )
}

export default Footer
