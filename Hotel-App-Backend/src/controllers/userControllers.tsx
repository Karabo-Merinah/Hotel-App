import { Request, Response } from "express";
import connectionPool from "../config/database";
import bcrypt from "bcryptjs";
//user updates their profile 

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user_id = res.locals.userId
        const name = req.body.name
        const phone_number = req.body.phone

        //checks if name is filled in 
        if (!name || String(name).trim() === "") {
            return res.status(400).json({ message: "Name is required." })
        }
        // Check phone number if provided, since it is optional
        let cellphone_number: string | null = null

        if (phone_number) {
            cellphone_number = String(phone_number).trim()

            if (cellphone_number.length !== 10) {
                return res.status(400).json({ message: "Phone number must contain exactly 10 digits." })
            }
            if (!cellphone_number.startsWith("0")) {
                return res.status(400).json({ message: "Phone number must start with 0." })
            }
            const allowed_characters = "0123456789"
            for (let i = 0; i < cellphone_number.length; i++) {
                const character = cellphone_number.charAt(i)
                if (!allowed_characters.includes(character)) {
                    return res.status(400).json({ message: "Phone number must contain digits only." })
                }
            }
        }
        const results = await connectionPool.query(
            "UPDATE users SET name=$1,phone=$2 WHERE id=$3 RETURNING id,name,email,phone,role",
            [String(name).trim(), cellphone_number, user_id]
        )
        if (results.rows.length === 0) {
            return res.status(404).json({ message: "User not found." })
        }
        return res.status(200).json(results.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not update the profile." })
    }
}

//gets user profile 
export const getProfile = async (req: Request, res: Response) => {
    try {
        const result = await connectionPool.query(
            "SELECT id,name,email,phone,role,provider,created_at FROM users WHERE id=$1", [res.locals.userId]
        )
        return res.status(200).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get the profile." })
    }
}

//changing password 
export const changePassword = async (req: Request, res: Response) => {
    try {
        const user_id = res.locals.userId
        const { current_password, new_password, confirm_password } = req.body

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({ message: "All fields are required." })
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({message: "Passwords do not match." })
        }

        if (new_password.length < 8) {
            return res.status(400).json({message: "Password must be at least 8 characters."})
        }

        const result = await connectionPool.query("SELECT password_hash FROM users WHERE id = $1",
            [user_id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        const user = result.rows[0]

        if (!user.password_hash) {
            return res.status(400).json({message: "Password change is unavailable for this account." })
        }

        const isMatch = await bcrypt.compare(current_password,user.password_hash
        )

        if (!isMatch) {
            return res.status(400).json({message: "Current password is incorrect." })
        }

        const isSamePassword = await bcrypt.compare(new_password,user.password_hash
        )
        if (isSamePassword) {
            return res.status(400).json({message: "New password cannot be the same as the current password."
            })
        }
        const hashedPassword = await bcrypt.hash(new_password, 10)
        await connectionPool.query( "UPDATE users SET password_hash = $1 WHERE id = $2", [hashedPassword, user_id]
        )
        return res.status(200).json({  message: "Password changed successfully."})
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Could not change password."
        })
    }
}