
import { useEffect, useState } from "react"
import api from "../../api/axios"
import { Texts } from "../../components/Texts/texts"
import "../../styles/AdminReviews.css"

// Review information returned by the backend
interface AdminReview {
    id: number
    reviewer_name: string
    hotel_name: string
    rating: number
    comment: string
    created_at: string
}

const AdminReviews = () => {
    const [reviews, setReviews] = useState<AdminReview[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Get all reviews for the admin
    useEffect(() => {
        const getReviews = async () => {
            try {
                setLoading(true)
                setError("")
                const token = localStorage.getItem("token")
                const response = await api.get("/api/admin/reviews", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setReviews(response.data)
            }
            catch (error) {
                console.log(error)
                setError("Could not load reviews.")
            }
            finally {
                setLoading(false)
            }
        }
        getReviews()
    }, [])

    return (
        <div className="admin-reviews">
            <Texts variant="h1">Hotel Reviews</Texts>
            <Texts variant="p">View guest reviews and ratings for all hotels.</Texts>
            {loading && <p>Loading reviews...</p>}
            {error && <p className="admin-reviews-error">{error}</p>}
            {!loading && !error && reviews.length === 0 && (
                <p>No reviews found.</p>
            )}
            {!loading && !error && reviews.length > 0 && (
                <div className="admin-reviews-list">
                    {reviews.map((review) => (
                        <div className="admin-review-card" key={review.id}>
                            <Texts variant="h3">{review.hotel_name}</Texts>

                            <p><strong>Guest:</strong> {review.reviewer_name}</p>
                            <p><strong>Rating:</strong> {review.rating} / 5</p>
                            <p><strong>Comment:</strong> {review.comment || "No comment provided."}</p>
                            <p className="admin-review-date">
                                {new Date(review.created_at).toLocaleDateString("en-ZA")}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminReviews
