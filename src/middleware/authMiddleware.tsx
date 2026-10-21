import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"

//Only logged in users are allowed 

export const requiresLogin = (req: Request, res: Response, next: NextFunction) => {
    const authorization_header = req.headers.authorization
  
    //if there's no header or it doesn't have keyword "Bearer" throw message
    
    if (!authorization_header || !authorization_header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Please log in first" })
    }

    //splits the bearer with space and keep the second part which is a token
    const token = authorization_header.split(" ")[1]

    try {
        //checks the header signature and expiry date 
        const decoded = jwt.verify(token, process.env.JWT_CODE as string) as { userId: number, role: string }
        // saves the id and role on locals so the controller can read them later.
        res.locals.userId = decoded.userId
        res.locals.role = decoded.role
        //lets request move on the next step
        next()

    }
    catch (error) {
        return res.status(401).json({ message: "Your login has expired ,please log in again " })
    }
}

//Only admins are allowed 

export const requiresAdmin = (req: Request, res: Response, next: NextFunction) => {
    //checks the role of the logged in user 
    if (res.locals.role !== "admin") {
        return res.status(403).json({ message: "Only admins are allowed." })
    }
    next()
}
