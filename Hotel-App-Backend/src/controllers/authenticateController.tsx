import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectionPool from "../config/database";
import { OAuth2Client } from "google-auth-library"

//Creating login token  that takes user d and role
const create_token = (userId: number, role: string) => {
    return jwt.sign({ userId: userId, role: role },
        process.env.JWT_CODE as string,
        //sets the user token o expire after  2 hours
        { expiresIn: "2h" }
    )
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const registerUser = async (req: Request, res: Response) => {
    try {
        const full_name = req.body.name
        const email = req.body.email
        const password: string = req.body.password
        const confirm_password: string = req.body.confirm_password

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

        // Check password length
        if (password.length < 8 ) {
            return res.status(400).json({ message: "Password must contain at least 8 characters." })
        }
        // Check lowercase letter
        const hasLowercase = password.split("").some((letter: string) => letter >= "a" && letter <= "z")

        if (!hasLowercase) {
            return res.status(400).json({ message: "Password must contain a lowercase letter." })
        }

        // Check uppercase letter
        const hasUppercase = password.split("").some((letter: string) => letter >= "A" && letter <= "Z")

        if (!hasUppercase) {
            return res.status(400).json({ message: "Password must contain an uppercase letter." })
        }

        // Check number
        const hasNumber = password.split("").some((letter: string) => letter >= "0" && letter <= "9")

        if (!hasNumber) {
            return res.status(400).json({ message: "Password must contain a number." })
        }
        // Check special character
        const specialCharacters = "@#$%&*!?"
        const hasSpecialCharacter = password.split("").some((letter: string) =>
            specialCharacters.includes(letter)
        )
        if (!hasSpecialCharacter) {
            return res.status(400).json({
                message: "Password must contain a special character (@, #, $, %, &, *, !, ?)."
            })
        }
        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match." })
        }

        //check if the email format is correct.
        const email_re1 = email.endsWith("@gmail.com")
        const email_re2 = email.includes(" ")

        if (!email_re1 || email_re2) {
            return res.status(400).json({ message: "Please enter a valid Gmail address. Example: example@gmail.com" })
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

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const credential = req.body.credential
        if (!credential) {
            return res.status(400).json({ message: "Google credential is required." })
        }
        // Verify the Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential, audience: process.env.GOOGLE_CLIENT_ID
        })
        const googleUser = ticket.getPayload()
        if (!googleUser || !googleUser.email || !googleUser.email_verified) {
            return res.status(401).json({ message: "Invalid Google account." })
        }
        const email = googleUser.email.toLowerCase()
        const name = googleUser.name || email
        const provider_id = googleUser.sub
        // Check if the Google account already exists
        const existing_user = await connectionPool.query("SELECT id,name,email,role FROM users WHERE provider=$1 AND provider_id=$2",
            ["google", provider_id]
        )
        let user
        if (existing_user.rows.length > 0) {
            user = existing_user.rows[0]
        }
        else {
            // Prevent automatically linking an existing email/password account
            const email_result = await connectionPool.query("SELECT id FROM users WHERE LOWER(email)=$1",
                [email]
            )
            if (email_result.rows.length > 0) {
                return res.status(409).json({ message: "An account with this email already exists. Please log in using your existing method." })
            }
            // Register the Google user
            const result = await connectionPool.query(`INSERT INTO users (name,email,provider,provider_id) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role`,
                [name, email, "google", provider_id])
            user = result.rows[0]
        }
        // Generate the same JWT used by normal login
        const token = create_token(user.id, user.role)
        return res.status(200).json({ user, token })
    }
   catch (error) {
    console.log("Google authentication error:", error)
    return res.status(500).json({message: "Could not complete Google authentication."})
}
}
