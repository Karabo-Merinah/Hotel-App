import { Request, Response } from "express";
import connectionPool from "../config/database";

//logged in users can write review for a  hotel 

export const createReview = async (req: Request, res: Response) => {
    try {
        const user_id = res.locals.userId
        const hotel_id = Number(req.body.hotel_id)
        const rating = Number(req.body.rating)

        let comment = ""
        if (req.body.comment) {
            comment = String(req.body.comment).trim()
        }
        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id must be a number." })
        }
        if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be a  number from 1 to 5." })
        }
        if (comment.length > 400) {
            return res.status(400).json({ message: "Comment is too long . Recommended length is 400 characters" })
        }

        //checks if hotel exists 
        const hotel_result = await connectionPool.query(
            "SELECT id FROM hotels WHERE id=$1", [hotel_id]
        )
        if (hotel_result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }
        // Users can review a hotel after completing their stay
        const booking_result = await connectionPool.query(`SELECT id FROM booking  WHERE user_id=$1 AND status='confirmed'
        AND check_out <= CURRENT_DATE AND room_id IN (SELECT id FROM rooms WHERE hotel_id=$2)`,
            [user_id, hotel_id]
        )
        if (booking_result.rows.length === 0) {
            return res.status(403).json({message: "You can only review a hotel after completing your stay." })
        }
        //only review per user per hotel 
        const existing = await connectionPool.query(
            "SELECT id FROM reviews WHERE user_id=$1 AND hotel_id=$2", [user_id, hotel_id]
        )
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "You have already reviewed this hotel." })
        }

        const results = await connectionPool.query(
            "INSERT INTO reviews (user_id,hotel_id,rating,comment) VALUES($1,$2,$3,$4) RETURNING id,user_id,hotel_id,rating,comment,created_at",
            [user_id, hotel_id, rating, comment]
        )
        return res.status(201).json(results.rows[0])

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not  create the review." })
    }
}

//get the reviews of a hotel with the average rating for publics 

export const getHotelReviews = async (req: Request, res: Response) => {
    try {
        const hotel_id = Number(req.params.hotelId)

        if (isNaN(hotel_id)) {
            return res.status(400).json({ message: "Hotel id  must be a number." })
        }

        const hotel_results = await connectionPool.query(
            "SELECT id FROM hotels WHERE id=$1", [hotel_id]
        )
        if (hotel_results.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found." })
        }

        //average ratings and number of reviews
        const avg_ratings = await connectionPool.query(
            "SELECT ROUND(AVG(rating),1) AS average_rating, COUNT(*) AS review_count FROM reviews WHERE hotel_id=$1",
            [hotel_id]
        )

        //reviews and the name of the person 
        const reviews = await connectionPool.query(
            `SELECT id,rating,comment,created_at,(SELECT name FROM users WHERE users.id=reviews.user_id) AS reviewer_name 
        FROM reviews WHERE hotel_id=$1 ORDER BY created_at DESC`, [hotel_id]
        )

        //convert the ratings and count into a number 
        return res.status(200).json({
            average_rating: Number(avg_ratings.rows[0].average_rating),
            reviews_count: Number(avg_ratings.rows[0].review_count),
            reviews: reviews.rows
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get the reviews." })
    }
}


//user deletes their own review and admin  can delete any review.
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const review_id = Number(req.params.id)
        if (!Number.isInteger(review_id) || review_id <= 0) {
            return res.status(400).json({ message: "Review id must be a positive number." })
        }
        const result = res.locals.role === "admin" ? await connectionPool.query("DELETE FROM reviews WHERE id=$1 RETURNING id", [review_id])
            : await connectionPool.query("DELETE FROM reviews WHERE id=$1 AND user_id=$2 RETURNING id", [review_id, res.locals.userId])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Review not found." })
        }
        return res.status(200).json({ message: "Review deleted." })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not delete the review." })
    }
}
