import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { Star } from "lucide-react"
import { Texts } from "../components/Texts/texts"
import "../styles/WriteReview.css"

const WriteReview = () => {
    const { hotelId } = useParams()
    const navigate = useNavigate()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        if (!hotelId) return
        if (rating === 0) {
            setError("Please select a rating.")
            return
        }
        try {
            setSubmitting(true)
            setError("")
            await axios.post("http://localhost:5000/api/reviews",{hotel_id: Number(hotelId),rating,comment},{headers: {Authorization: `Bearer ${token}`}})
            navigate(`/hotels/${hotelId}`)
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Could not submit review.")
            }
            else {
                setError("Could not submit review.")
            }
        }
        finally {
            setSubmitting(false)
        }
    }
    return (
        <div className="write-review-container">
            <button type="button" onClick={() => navigate(`/hotels/${hotelId}`)}> ← Back to Hotel</button>
            <Texts variant="h1">Write a Review</Texts>
            <form onSubmit={submitReview}>
                <Texts variant="h2">Rate your experience</Texts>
                <div className="review-stars"> {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} title={`${star} star${star > 1 ? "s" : ""}`}aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}>
                <Star size={30} fill={star <= rating ? "#f5b301" : "none"}color="#f5b301"/></button>))}
                </div>
                <label htmlFor="review-comment">Your review</label>
                <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={400} rows={5} placeholder="Tell us about your experience..."/>
                <Texts variant="p">{comment.length}/400 characters</Texts>
                {error && <Texts variant="p">{error}</Texts>}
                <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Review"}</button>
            </form>
        </div>
    )
}

export default WriteReview