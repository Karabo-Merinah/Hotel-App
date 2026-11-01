
import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface AdminRouteProps {
    children: ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "null")

    if (!token) {
        return <Navigate to="/login" replace />
    }
    if (user?.role !== "admin") {
        return <Navigate to="/" replace />
    }
    return children
}

export default AdminRoute
