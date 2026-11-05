import { useState } from "react"
import { Texts } from "../components/Texts/texts"
import api from "../api/axios"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import "../styles/Register.css"
import { GoogleLogin } from "@react-oauth/google"
import { useDispatch } from "react-redux"
import { loginSuccess } from "../features/authSlice"
import { Eye, EyeOff } from "lucide-react"

const Register = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "", general: "" })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)
    // Register a new user
    const registering = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading) return

        // Reset validation errors before checking the fields
        const newErrors = { name: "", email: "", password: "", confirmPassword: "", general: "" }

        // Check if the name is provided
        if (!name.trim()) {
            newErrors.name = "Name is required."
        }

        // Check if the email is provided
        if (!email.trim()) {
            newErrors.email = "Email is required."
        }
        // Check if the email address is valid
        else if (!email.includes("@") || !email.includes(".")) {
            newErrors.email = "Please enter a valid email address."
        }

        // Check if the password is provided
        if (!password) {
            newErrors.password = "Password is required."
        }
        // Check if the password has at least 8 characters
        else if (password.length < 8 || password.length > 10) {
            newErrors.password = "Password must contain 8 to 10 characters."
        }

        // Check if the confirm password is provided
        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required."
        }
        // Check if both passwords match
        else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match."
        }

        // Update the validation errors
        setErrors(newErrors)

        // Stop registration if any field has an error
        if (newErrors.name || newErrors.email || newErrors.password || newErrors.confirmPassword) {
            return
        }

        try {
            setLoading(true)
            // Send registration details to the backend
            const response = await api.post("/api/auth/register", { name, email, password, confirm_password: confirmPassword })

            // Save authentication details
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            // Update Redux after successful registration
            dispatch(loginSuccess({
                user: response.data.user,
                token: response.data.token
            }))

            // Redirect based on the user's role
            const role = response.data.user.role
            const from = role === "admin" ? "/admin" : location.state?.from || "/"

            // Preserve booking details during navigation
            navigate(from, {
                replace: true,
                state: {
                    checkIn: location.state?.checkIn,
                    checkOut: location.state?.checkOut,
                    guests: location.state?.guests,
                    numberOfRooms: location.state?.numberOfRooms
                }
            })
        }
        catch (error) {
            console.log(error)
            // Display registration errors returned by the backend
            if (axios.isAxiosError(error)) {
                newErrors.general = error.response?.data?.message || "Registration failed. Please try again."
            } else {
                newErrors.general = "Registration failed. Please try again."
            }

            setErrors(newErrors)
        }
        finally {
            setLoading(false)
        }
    }

    // Register or log in a user using their Google account
    const GoogleRegister = async (credential: string) => {
        if (loading) return

        try {
            setLoading(true)
            setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "" })

            // Send Google credential to the backend
            const response = await api.post("/api/auth/google", { credential })
            // Save authentication details
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            // Update Redux after successful Google authentication
            dispatch(loginSuccess({
                user: response.data.user, token: response.data.token
            }))

            // Redirect Google users based on their role
            const role = response.data.user.role
            const from = role === "admin" ? "/admin" : location.state?.from || "/"

            navigate(from, {
                replace: true, state: {
                    checkIn: location.state?.checkIn, checkOut: location.state?.checkOut,
                    guests: location.state?.guests, numberOfRooms: location.state?.numberOfRooms
                }
            })
        }
        catch (error) {
            console.log(error)

            // Display Google authentication errors
            if (axios.isAxiosError(error)) {
                setErrors({ name: "", email: "", password: "", confirmPassword: "", general: error.response?.data?.message || "Google registration failed. Please try again." })
            }
            else {
                setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "Google registration failed. Please try again." })
            }
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="register-heading">
                <Texts variant="h1">Create An Account</Texts>
                <Texts variant="p">Join Wander Inn and start booking your perfect stay.</Texts>
            </div>
            <form className="register-form" onSubmit={registering} noValidate>
                <div className="register-name">
                    <label htmlFor="name">Name</label>
                    <input id="name" className="register-name-input" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                    {errors.name && <Texts variant="p" className="register-error">{errors.name}</Texts>}
                </div>
                <div className="register-email">
                    <label htmlFor="email">Email</label>
                    <input id="email" className="register-email-input" type="email" placeholder="e.g example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    {errors.email && <Texts variant="p" className="register-error">{errors.email}</Texts>}
                </div>
                <div className="register-password">
                    <label htmlFor="password">Password</label>
                    <div className="register-password-wrapper">
                        <input id="password" className="register-password-input" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} minLength={8} maxLength={10} required />
                        <button type="button" className="register-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                    </div>
                    {passwordFocused && (
                        <div className="register-password-requirements">
                            <p>Password must contain:</p>
                            <ul>
                                <li>8 to 10 characters</li>
                                <li>At least one lowercase letter</li>
                                <li>At least one uppercase letter</li>
                                <li>At least one number</li>
                                <li>At least one special character (@#$%&*!?)</li>
                            </ul>
                        </div>
                    )}
                    {errors.password && <Texts variant="p" className="register-error">{errors.password}</Texts>}
                </div>
                <div className="register-confirm-password">
                    <label htmlFor="confirmPassword">Re-enter password</label>
                    <div className="register-password-wrapper">
                        <input id="confirmPassword" className="register-confirm-input" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <button type="button" className="register-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                    </div>
                    {errors.confirmPassword && <Texts variant="p" className="register-error">{errors.confirmPassword}</Texts>}
                </div>
                {errors.general && <Texts variant="p" className="register-error">{errors.general}</Texts>}
                <button className="register-button" type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
            </form>
            <div className="register-divider">
                <Texts variant="p">OR</Texts>
            </div>
            {/* Google OAuth registration */}
            <div className="register-google">
                <GoogleLogin onSuccess={(response) => { if (response.credential) GoogleRegister(response.credential); else setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "Google registration failed." }) }} onError={() => setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "Google registration failed." })} />
            </div>
            {/* Navigate to login if the user already has an account */}
            <div className="register-login">
                <Texts variant="p">Already have an account?</Texts>
                <button className="register-login-button" type="button" onClick={() => navigate("/login", { state: location.state })}>Login</button>
            </div>
        </div>
    )
}

export default Register
