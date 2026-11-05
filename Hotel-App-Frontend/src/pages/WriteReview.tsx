import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import api from "../api/axios"
import { Star } from "lucide-react"
import { Texts } from "../components/Texts/texts"
import "../styles/WriteReview.css"
import Popup from "../components/Popup"

const WriteReview = () => {
    const { hotelId } = useParams()
    const navigate = useNavigate()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [popup, setPopup] = useState("")

    const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if(submitting) return 
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login", {
                state: {
                    from: `/hotels/${hotelId}/review`
                }
            })
            return
        }
        if (!hotelId) return
        if (rating === 0) {
            setPopup("Please select a rating ")
            return
        }
        try {
            setSubmitting(true)
            await api.post("/api/reviews", { hotel_id: Number(hotelId), rating, comment }, { headers: { Authorization: `Bearer ${token}` } })
            navigate(`/hotels/${hotelId}`, {
                state: { popup: "Your review has been submitted successfully!" }
            })
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Could not submit review."
                setPopup(message)
            } else {
                setPopup("Could not submit review.")
            }
        }
        finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (!popup) return
        const timer = setTimeout(() => setPopup(""), 3000)
        return () => clearTimeout(timer)
    }, [popup])

    return (
        <div className="write-review-container">
             {popup && <Popup message={popup} type="error" onClose={() => setPopup("")} />}
            <button type="button" onClick={() => navigate(`/hotels/${hotelId}`)}> ← Back to Hotel</button>
            <Texts variant="h1">Write a Review</Texts>
            <form onSubmit={submitReview}>
                <Texts variant="h2">Rate your experience</Texts>
                <div className="review-stars"> {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} title={`${star} star${star > 1 ? "s" : ""}`} aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}>
                        <Star size={30} fill={star <= rating ? "#f5b301" : "none"} color="#f5b301" /></button>))}
                </div>
                <label htmlFor="review-comment">Your review</label>
                <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={400} rows={5} placeholder="Tell us about your experience..." />
                <Texts variant="p">{comment.length}/400 characters</Texts>
                <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Review"}</button>
            </form>
        </div>
    )
}

export default WriteReview