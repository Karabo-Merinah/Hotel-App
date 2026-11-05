import { CheckCircle, XCircle, X } from "lucide-react"
import "../styles/Popup.css"

interface PopupProps {
    message: string
    type: "success" | "error"
    onClose: () => void
}

const Popup = ({ message, type, onClose }: PopupProps) => {
    return (
        <div className={`popup popup-${type}`} role="alert">
            {type === "success" ? <CheckCircle size={22} /> : <XCircle size={22} />}
            <span>{message}</span>
            <button type="button" onClick={onClose} aria-label="Close notification"><X size={18} /></button>
        </div>
    )
}

export default Popup