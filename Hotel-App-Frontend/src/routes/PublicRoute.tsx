import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

interface Props {
    children: ReactNode
}

const PublicRoute = ({ children }: Props) => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "null")

    // Check if the user is already logged in
    if (token) {

        // Redirect admins to the admin dashboard
        if (user?.role === "admin") {
            return <Navigate to="/admin" replace />
        }

        // Redirect regular users to the home page
        return <Navigate to="/" replace />
    }

    // Allow users who are not logged in to access Login and Register
    return children
}

export default PublicRoute