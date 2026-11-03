import { useState } from "react";
import { Texts } from "../components/Texts/texts";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Register.css"
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux"
import { loginSuccess } from "../features/authSlice"


const Register = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    //registers new user 
    const registering = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        //checks if all fields are filled in 
        if (!name.trim()) {
            setError("Name is required")
            return
        }
        if (!email.trim()) {
            setError("Email is required.")
            return
        }
        if (!password) {
            setError("Password is required.")
            return
        }
        if (!confirmPassword) {
            setError("Confirm password is required.")
            return
        }

        //check the password length 
        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }
        //check if password match 
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (!email.trim() || !email.includes("@") || !email.includes(".")) {
            setError("Please enter a valid email address.")
            return
        }
        try {
            setLoading(true)
            //send the registration details to the backend 
            const response = await axios.post("http://localhost:5000/api/auth/register", { name, email, password, confirm_password: confirmPassword })

            //saves the login details returned by backend 
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            // update Redux after successful registration
            dispatch(loginSuccess({
                user: response.data.user,
                token: response.data.token
            }))

            setSuccess("Registration successful.")
            // redirects the user to the page they wanted to visit
            const from = location.state?.from || "/"

            // stores booking details during navigation
            navigate(from, {
                replace: true, state: { checkIn: location.state?.checkIn, checkOut: location.state?.checkOut, guests: location.state?.guests, numberOfRooms: location.state?.numberOfRooms }
            })
        }
        catch (error) {
            console.log(error)
            //displays backend error
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Registration failed. Please try again.")
            }
            else {
                setError("Google registration failed. Please try again.")
            }
        }
        finally {
            setLoading(false)
        }
    }

    // Register or log in a user using their Google account
    const GoogleRegister = async (credential: string) => {
        try {
            setLoading(true)
            setError("")
            // send the Google credential to the backend for verification
            const response = await axios.post("http://localhost:5000/api/auth/google", {
                credential
            })

            // save the authenticated user and token
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            // update Redux after successful Google registration
            dispatch(loginSuccess({
                user: response.data.user,
                token: response.data.token
            }))
            // redirect to the previous page while storing booking details
            const from = location.state?.from || "/"

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
            // display an error if Google registration fails
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Google registration failed. Please try again.")
            }
            else {
                setError("Google registration failed. Please try again.")
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
            <form className="register-form" onSubmit={registering}>
                <div className="register-name">
                    <label htmlFor="name">Name</label>
                    <input id="name" className="register-name-input" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="register-email">
                    <label htmlFor="email">Email</label>
                    <input id="email" className="register-email-input" type="email" placeholder="e.g example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="register-password">
                    <label htmlFor="password">Password</label>
                    <input id="password" className="register-password-input" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
                </div>
                <div className="register-confirm-password">
                    <label htmlFor="confirmPassword">Re-enter password</label>
                    <input id="confirmPassword" className="register-confirm-input" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                {error &&
                    <Texts variant="p" className="register-error">{error}</Texts>
                }
                {success &&
                    <Texts variant="p" className="register-success">{success}</Texts>
                }
                <button className="register-button" type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
            </form>
            <div className="register-divider">
                <Texts variant="p">OR</Texts>
            </div>
            {/* Google OAuth registration */}
            <div className="register-google">
                <GoogleLogin onSuccess={(response) => { if (response.credential) GoogleRegister(response.credential) }} onError={() => setError("Google registration failed.")} />
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