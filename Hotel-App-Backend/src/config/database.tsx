import { Pool } from "pg"
import dotenv from "dotenv"


dotenv.config()

//creating connection
const connectionPool = new Pool({ connectionString: process.env.DATABASE_URL })
// Testing connection
export const testConnection = async () => {
    try {
        const client = await connectionPool.connect()
        console.log("Database connected successfully")
        client.release()
    }
    catch (error) {
        console.log("Database connection failed:", error)
    }
}

export default connectionPool