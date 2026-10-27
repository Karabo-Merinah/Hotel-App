import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

//creating connection
const connectionPool = new Pool({ connectionString: process.env.DATABASE_URL })

//testing connection 

export const testConnection = async () => {
    try {
        const client = await connectionPool.connect()
        console.log("Connected successfully")
        client.release()
    }
    catch (error) {
        console.log(error)
    }
}

export default connectionPool;