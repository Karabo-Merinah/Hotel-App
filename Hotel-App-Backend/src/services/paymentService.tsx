import connectionPool from "../config/database"

// Currency used for payments
export const currency = "ZAR"

// Send requests to Paystack
export const paystackRequest = async (path: string,method: "GET" | "POST",body?: object) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
        throw new Error("Paystack secret key is missing.")
    }
    const response = await fetch(`https://api.paystack.co${path}`, {
        method,headers: {Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json"
        },body: body ? JSON.stringify(body) : undefined
    })
    const result = await response.json()
    if (!response.ok || !result.status) {
        throw new Error(result.message || "Paystack request failed.")
    }
    return result.data
}
// Mark a payment as failed
export const markPaymentFailed = async (reference: string) => {
    await connectionPool.query(`UPDATE payments SET status = 'failed', updated_at = NOW()  WHERE payment_reference = $1 AND status = 'pending'`,
        [reference]
    )
}