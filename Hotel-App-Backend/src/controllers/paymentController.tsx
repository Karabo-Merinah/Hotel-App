import { Request, Response } from "express"
import { randomBytes } from "crypto"
import connectionPool from "../config/database"
import { paystackRequest, markPaymentFailed, currency } from "../services/paymentService"

// Initialize payment for a booking
export const createPayment = async (req: Request, res: Response) => {
    try {
        // Get the logged-in user's ID and booking ID
        const user_id = res.locals.userId
        const booking_id = parseInt(req.body.booking_id)

        // Check if the booking ID is valid
        if (isNaN(booking_id) || booking_id <= 0) {
            return res.status(400).json({ message: "Invalid booking ID." })
        }

        // Get the booking details and the user's email
        const booking_result = await connectionPool.query(`SELECT bookings.id, bookings.total_price, bookings.status, users.email
             FROM bookings, users  WHERE bookings.user_id = users.id
             AND bookings.id = $1 AND bookings.user_id = $2`,
            [booking_id, user_id]
        )

        // Check if the booking belongs to the logged-in user
        if (booking_result.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found." })
        }

        // Only pending bookings can be paid
        const booking = booking_result.rows[0]
        if (booking.status !== "pending") {
            return res.status(409).json({ message: "Only pending bookings can be paid." })
        }
        // Check if the booking already has a pending or completed payment
        const existing_payment = await connectionPool.query(
            `SELECT id FROM payments WHERE booking_id = $1 AND status IN ('pending', 'paid')`,
            [booking_id]
        )

        // Prevent another payment from being created for the same booking
        if (existing_payment.rows.length > 0) {
            return res.status(409).json({ message: "This booking already has a payment in progress or completed." })
        }

        // Get the booking amount from the database
        const amount = Number(booking.total_price)

        // Check if the amount is valid before sending it to Paystack
        if (!Number.isSafeInteger(Math.round(amount * 100)) || amount <= 0) {
            return res.status(400).json({ message: "Invalid booking amount." })
        }

        // Generate a unique payment reference
        const reference = `BK${booking_id}-${randomBytes(8).toString("hex")}`

        // Save the payment as pending before redirecting to Paystack
        await connectionPool.query(`INSERT INTO payments (booking_id, amount, currency, status, payment_reference)
             VALUES ($1, $2, $3, 'pending', $4)`, [booking_id, amount, currency, reference]
        )

        try {
            // Send the payment details to Paystack
            const paystack = await paystackRequest("/transaction/initialize", "POST", {
                email: booking.email,
                // Convert the amount from rands to cents
                amount: Math.round(amount * 100), currency, reference,
                // Page the user returns to after payment
                callback_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success`
            }
            )

            // Return the Paystack checkout link to the frontend
            return res.status(201).json({
                authorization_url: paystack.authorization_url, reference, booking_id
            })
        }
        catch (error) {
            console.log(error)
            // Mark the payment as failed if initialization fails
            await markPaymentFailed(reference)
            return res.status(502).json({ message: "Could not initialize payment." })
        }
    }
    catch (error) {
        console.log(error)

        return res.status(500).json({ message: "Could not create payment." })
    }
}

// Verify a payment with Paystack before confirming the booking
export const verifyPayment = async (req: Request, res: Response) => {
    const client = await connectionPool.connect()

    try {
        // Get the logged-in user's ID and payment reference
        const user_id = res.locals.userId
        const reference = String(req.params.reference)

        // Find the payment and ensure it belongs to the logged-in user

        const payment_result = await client.query(`SELECT payments.id, payments.booking_id, payments.amount, payments.currency, payments.status
         FROM payments, bookings WHERE payments.booking_id = bookings.id
         AND payments.payment_reference = $1 AND bookings.user_id = $2`,
            [reference, user_id]
        )
        if (payment_result.rows.length === 0) {
            return res.status(404).json({ message: "Payment not found." })
        }

        const payment = payment_result.rows[0]


        // Return the existing result if payment was already verified

        if (payment.status === "paid") {
            return res.status(200).json({
                message: "Payment already verified.", status: "paid",
                booking_id: payment.booking_id
            })
        }
        // Ask Paystack for the actual payment status

        const paystack = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`,
            "GET"
        )

        // Convert the saved payment amount to cents for comparison
        const expected_amount = Math.round(Number(payment.amount) * 100)

        // Check payment status, reference, amount and currency
        if (paystack.status !== "success" || paystack.reference !== reference || Number(paystack.amount) !== expected_amount ||
            paystack.currency !== payment.currency
        ) {
            // Update the payment if Paystack reports a failed transaction
            if (paystack.status === "failed" || paystack.status === "abandoned") {
                await markPaymentFailed(reference)
            }
            return res.status(200).json({
                message: "Payment has not been confirmed.", status: paystack.status,
                booking_id: payment.booking_id
            })
        }
        await client.query("BEGIN")
        const booking_result = await client.query(`SELECT id, status FROM bookings WHERE id = $1 FOR UPDATE`,
            [payment.booking_id]
        )
        // Lock the booking to prevent conflicting updates

        if (booking_result.rows.length === 0 || booking_result.rows[0].status !== "pending"
        ) {
            await client.query("ROLLBACK")
            return res.status(409).json({ message: "This booking cannot be confirmed." })
        }
        // Check whether another payment has already paid for this booking

        const paid_result = await client.query(`SELECT id FROM payments WHERE booking_id = $1 AND status = 'paid'`,
            [payment.booking_id]
        )
        if (paid_result.rows.length > 0) {
            await client.query("ROLLBACK")
            return res.status(409).json({ message: "This booking has already been paid." })
        }
        // Update the payment status to paid
        await client.query(`UPDATE payments SET status = 'paid', updated_at = NOW() WHERE id = $1`,
            [payment.id]
        )
        // Confirm the booking after successful payment verification
        await client.query(`UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
            [payment.booking_id]
        )
        await client.query("COMMIT")
        return res.status(200).json({
            message: "Payment successful. Booking confirmed.", status: "paid", booking_id: payment.booking_id
        })
    }
    catch (error) {
        await client.query("ROLLBACK").catch(console.log)
        console.log(error)
        return res.status(502).json({ message: "Could not verify payment. Please try again." })
    }
    finally {
        client.release()
    }
}