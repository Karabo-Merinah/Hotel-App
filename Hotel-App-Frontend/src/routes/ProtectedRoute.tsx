import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

interface Props {
    children: ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
    const location = useLocation()
    const token = localStorage.getItem("token")
    if (!token) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname, ...location.state }} />
        )
    }
    return children
}

export default ProtectedRoute