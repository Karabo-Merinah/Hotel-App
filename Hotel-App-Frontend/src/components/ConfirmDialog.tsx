import "../styles/ConfirmDialog.css"

interface ConfirmDialogProps {
    title?: string
    message: string
    onConfirm: () => void
    onClose: () => void
    loading: boolean
}

const ConfirmDialog = ({ title = "Confirm Action", message, onConfirm, onClose, loading }: ConfirmDialogProps) => {
    return (
        <div className="confirm-overlay">
            <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <h2 id="confirm-title">{title}</h2>
                <p>{message}</p>
                <div className="confirm-buttons">
                    <button type="button" onClick={onClose} disabled={loading}>Go Back</button>
                    <button type="button" onClick={onConfirm} disabled={loading}>{loading ? "Processing..." : "Confirm"}</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog