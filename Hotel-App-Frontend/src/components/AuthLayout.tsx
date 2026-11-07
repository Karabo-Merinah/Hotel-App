import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import logo from "../assets/wander_inn_logo.png"
import "../styles/AuthLayout.css"

interface AuthLayoutProps {
    children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="auth-layout">
            <div className="auth-form-section">
                <Link to="/" className="auth-logo-link">
                    <img src={logo} alt="Wander Inn Logo" className="auth-logo" /></Link>

                {children}
            </div>

            <div className="auth-image"></div>
        </div>
    )
}

export default AuthLayout