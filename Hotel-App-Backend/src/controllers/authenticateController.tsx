import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectionPool from "../config/database";

//Creating login token  that takes user d and role
const create_token = (userId: number, role: string) => {
    return jwt.sign({ userId: userId, role: role },
        process.env.JWT_CODE as string,
        //sets the user token o expire after  2 hours
        { expiresIn: "2h" }
    )
}

export const registerUser = async (req: Request, res: Response) => {
    try {
        const full_name = req.body.name
        const email = req.body.email
        const password = req.body.password
        const confirm_password = req.body.confirm_password

        //check if all fields are filled in 

        if (!full_name) {
            return res.status(400).json({ message: "Name is required" })
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" })
        }
        if (!confirm_password) {
            return res.status(400).json({ message: "Confirm password is required ." })
        }

        //checks if passwords minimum length is met 

        if (password.length < 8) {
            return res.status(400).json({ message: "Password  must be at least 8 characters ." })
        }
        if (confirm_password.length < 8) {
            return res.status(400).json({ message: "Password  must be at least 8 characters ." })
        }

        //checks if password and confirm password are the same 

        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match." })
        }

        //check if the email format is correct.
        const email_re1 = email.includes("@")
        const email_re2 = email.includes(".")
        const email_re3 = email.includes(" ")

        if (!email_re1 || !email_re2 || email_re3) {
            return res.status(400).json({ message: "Enter an email with  valid email format.example:example@gmail.com" })
        }

        //check  if the email is already used  
        const email_stored = email.trim().toLowerCase()
        const existing_user = await connectionPool.query(
            "SELECT id FROM users WHERE email=$1", [email_stored]
        )
        if (existing_user.rows.length > 0) {
            return res.status(409).json({ message: "An account with this email already exists. " })
        }
        //Hash password and save the user   
        const hash_password = await bcrypt.hash(password, 10)
        const result = await connectionPool.query(
            "INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3)  RETURNING id,name,email,role",
            [full_name.trim(), email_stored, hash_password]
        )

        const new_user = result.rows[0]
        const token = create_token(new_user.id, new_user.role)

        return res.status(201).json({ user: new_user, token: token })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not  register user." })
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {

        const email = req.body.email
        const password = req.body.password

        if (!email) {
            return res.status(400).json({ message: "Email is required." })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required." })
        }
        const login_results = await connectionPool.query(
            "SELECT id,name,email,role,password_hash FROM users WHERE email=$1", [email.trim().toLowerCase()]
        )
        //if there are no result restrict authorization.
        if (login_results.rows.length == 0) {
            return res.status(401).json({ message: "Invalid email or password." })
        }
        const user = login_results.rows[0]

        //users who signed up but have no password
        if (!user.password_hash) {
            return res.status(401).json({ message: "Invalid email or password." })
        }

        const password_hash_matches = await bcrypt.compare(password, user.password_hash)
        if (!password_hash_matches) {
            return res.status(401).json({ message: "Invalid email or password." })
        }

        const token = create_token(user.id, user.role)

        return res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: token })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not login" })
    }
}

//Returns the logged in user 

export const getCurrentLoggedUser = async (req: Request, res: Response) => {
    try {

        //Reads the user id that the middleware saved for the request.
        const userId = res.locals.userId

        //checks for the user in the database.
        const result = await connectionPool.query(
            "SELECT id,name,email,phone,role FROM users WHERE id=$1", [userId]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." })
        }
        return res.status(200).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Could not get the user." })
    }
}
