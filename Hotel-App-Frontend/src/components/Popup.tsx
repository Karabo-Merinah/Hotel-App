import "../styles/Popup.css"
interface PopupProps {
    message: string
    type: "success" | "error"
    onClose: () => void
}

const Popup = ({ message, type, onClose }: PopupProps) => {
    return (
        <div className={`popup popup-${type}`} role="alert" onClick={onClose}>
            <span>{message}</span>
        </div>
    )
}

export default Popup
