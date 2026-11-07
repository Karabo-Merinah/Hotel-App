import { useLocation, useNavigate } from "react-router-dom"
import "../styles/AuthTabs.css"

interface AuthTabsProps {
    activeTab: "login" | "register"
}

const AuthTabs = ({ activeTab }: AuthTabsProps) => {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="auth-tabs" aria-label="Authentication">
            <button type="button" className={activeTab === "login" ? "auth-tab active" : "auth-tab"} aria-current={activeTab === "login" ? "page" : undefined} onClick={() => navigate("/login", { state: location.state })}>Login</button>
            <button type="button" className={activeTab === "register" ? "auth-tab active" : "auth-tab"} aria-current={activeTab === "register" ? "page" : undefined} onClick={() => navigate("/register", { state: location.state })}>Sign Up</button>
        </div>
    )
}

export default AuthTabs