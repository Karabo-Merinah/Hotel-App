import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Texts } from "../components/Texts/texts"
import "../styles/Login.css"

const Login = () => {

    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState("")

    // Log in the user
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors("")

        if (!email.trim()) {
            setErrors("Email is required.")
            return
        }
        if (!password) {
            setErrors("Password is required.")
            return
        }

        try {
            setLoading(true)
            // Send login details to the backend
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password
            })

            // Save the authentication token and user information
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            // Redirect the user to the home page
            navigate("/")

        } catch (error) {
            console.log(error)
            setErrors("Invalid email or password.")

        } finally {
            // Stop loading whether login succeeds or fails
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-heading">
                <Texts variant="h1">Welcome Back</Texts>
                <Texts variant="p">Login to your Wander Inn account.</Texts>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
                <div className="login-email">
                    <label htmlFor="login-email">Email</label>
                    <input id="login-email" className="login-email-input" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="login-password">
                    <label htmlFor="login-password">Password</label>
                    <input id="login-password" className="login-password-input" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {/* Navigate to the Forgot Password page */}
                <div className="login-forgot-password">
                    <button className="login-forgot-password-button" type="button" onClick={() => navigate("/forgot-password")}>Forgot Password?</button>
                </div>
                {errors && <Texts variant="p" className="login-error">{errors}</Texts>}
                <button className="login-button" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
            <div className="login-divider">
                <Texts variant="p">OR</Texts>
            </div>
            <div className="login-google">
                <button className="google-login-button" type="button">Continue with Google</button>
            </div>
            {/* Navigate to registration if the user has no account */}
            <div className="login-register">
                <Texts variant="p">Don't have an account?</Texts>
                <button className="login-register-button" type="button" onClick={() => navigate("/register")}>Register</button>
            </div>
        </div>
    )
}
export default Login