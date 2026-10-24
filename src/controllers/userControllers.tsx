import { Request, Response } from "express";
import connectionPool from "../config/database";

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
        //checks if the number it is entered as it is optional 

        let cellphone_number: string | null = null
        if (phone_number) {
            cellphone_number = String(phone_number).trim()

            if (cellphone_number.length > 20) {
                return res.status(400).json({ message: "Phone number is too long." })
            }
            const allowed_characters = "0123456789+"
            for (let i = 0; i < cellphone_number.length; i++) {

                const character = cellphone_number.charAt(i)

                //if the current character is not in the defined list 
                if (!allowed_characters.includes(character)) {
                    return res.status(400).json({ message: "Phone number can only be digits and + sign" })
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