import { useState } from "react";
import { Texts } from "../components/Texts/texts";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Register.css"

const Register = () => {

    const navigate = useNavigate()
    const location = useLocation()
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

        try {
            setLoading(true)
            //send the registration details to the backend 
            const response = await axios.post("http://localhost:5000/api/auth/register", { name, email, password, confirm_password: confirmPassword })

            //saves the login details returned by backend 
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            setSuccess("Registration successful.")
            // Redirect the user to the page they wanted to visit
            const from = location.state?.from || "/"
            navigate(from, {
                replace: true, state: { checkIn: location.state?.checkIn, checkOut: location.state?.checkOut, guests: location.state?.guests }
            })
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Registration failed.Please try again.")
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
            <div className="register-google">
                <button className="google-register-button" type="button">Continue with Google</button>
            </div>
            <div className="register-login">
                <Texts variant="p">Already have an account?</Texts>
                <button className="register-login-button" onClick={() => navigate("/login", { state: location.state })}>Login</button>
            </div>

        </div>
    )
}

export default Register