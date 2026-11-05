import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../api/axios"
import { Texts } from "../components/Texts/texts"
import "../styles/Login.css"
import { GoogleLogin } from "@react-oauth/google"
import { useDispatch } from "react-redux"
import { loginSuccess } from "../features/authSlice"
import { Eye, EyeOff } from "lucide-react"
import Popup from "../components/Popup"

const Login = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [showPassword, setShowPassword] = useState(false)
    const [popup, setPopup] = useState("")

    // Log in the user using email and password
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPopup("")

        //validates login inputs
        if (!email.trim()) {
            setPopup("Email is required.")
            return
        }
        if (!password) {
            setPopup("Password is required.")
            return
        }

        try {
            setLoading(true)
            // Send login details to the backend
            const response = await api.post("/api/auth/login", {
                email,
                password
            })

            // Save the authentication token and user information
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            // Update Redux with the logged in user's information
            dispatch(loginSuccess({
                user: response.data.user,
                token: response.data.token
            }))

            // Redirect admins to the admin dashboard and regular users to their previous page
            const role = response.data.user.role
            const from = role === "admin" ? "/admin" : location.state?.from || "/"

            //stores booking details when redirecting
            navigate(from, { replace: true, state: { checkIn: location.state?.checkIn, checkOut: location.state?.checkOut, guests: location.state?.guests, numberOfRooms: location.state?.numberOfRooms } })

        } catch (error) {
            console.log(error)
            setPopup("Invalid email or password.")

        } finally {
            // Stop loading whether login succeeds or fails
            setLoading(false)
        }
    }

    //log in user using their Google account
    const GoogleLoginOAuth = async (credential: string) => {
        try {
            setLoading(true)
            setPopup("")

            // Send the Google credential to the backend for verification
            const response = await api.post("/api/auth/google", {
                credential
            })
            // Save the authenticated user and token
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            // Update Redux after successful Google login
            dispatch(loginSuccess({
                user: response.data.user,
                token: response.data.token
            }))
            // Redirect Google users based on their role
            const role = response.data.user.role
            const from = role === "admin" ? "/admin" : location.state?.from || "/"

            navigate(from, {
                replace: true, state: {
                    checkIn: location.state?.checkIn,
                    checkOut: location.state?.checkOut,
                    guests: location.state?.guests,
                    numberOfRooms: location.state?.numberOfRooms
                }
            })
        }
        catch (error) {
            console.log(error)
            setPopup("Google login failed. Please try again.")
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!popup) return
        const timer = setTimeout(() => setPopup(""), 3000)
        return () => clearTimeout(timer)
    }, [popup])

    return (
        <div className="login-container">
              {popup && <Popup message={popup} type="error" onClose={() => setPopup("")} />}
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
                    <div className="login-password-wrapper">
                        <input id="login-password" className="login-password-input" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                {/* Navigate to the Forgot Password page */}
                <div className="login-forgot-password">
                    <button className="login-forgot-password-button" type="button" onClick={() => navigate("/forgot-password")}>Forgot Password?</button>
                </div>
                <button className="login-button" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
            <div className="login-divider">
                <Texts variant="p">OR</Texts>
            </div>
            <div className="login-google">
                <GoogleLogin onSuccess={(response) => { if (response.credential) GoogleLoginOAuth(response.credential); else setPopup("Google login failed.") }} onError={() => setPopup("Google login failed.")} />
            </div>
            {/* Navigate to registration if the user has no account */}
            <div className="login-register">
                <Texts variant="p">Don't have an account?</Texts>
                <button className="login-register-button" type="button" onClick={() => navigate("/register", { state: location.state })}>Register</button>
            </div>
        </div>
    )
}
export default Login