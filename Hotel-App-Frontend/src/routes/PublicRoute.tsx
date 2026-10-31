import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

interface Props {
    children: ReactNode
}

const PublicRoute = ({ children }: Props) => {
    const token = localStorage.getItem("token")
    if (token) {
        return <Navigate to="/" replace />
    }
    return children
}

export default PublicRoute