import { Request, Response } from "express"
import connectionPool from "../config/database"

//logged in users get notifications 

export const getMyNotifications=async(req:Request,res:Response)=>{
   try{

    const user_id=res.locals.userId 

    const results=await connectionPool.query(
        "SELECT id,message,is_read,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC,id DESC",[user_id]
    )
    return res.status(200).json(results.rows)
   } 
   catch(error){
    console.log(error)
    return res.status(500).json({message:"Could not get notifications."})
   }
}

//mark notification as read 

export const markedAsRead=async(req:Request,res:Response)=>{
    try{
        const user_id=res.locals.userId 
        const notification_id=Number(req.params.id)

        if(isNaN(notification_id)){
            return res.status(400).json({message:"Notification id must be a number."})
        }

        // ensures user only marks their own notifications.
        const result=await connectionPool.query(
            "UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2  RETURNING id,message,is_read,created_at",[notification_id,user_id]
        )
        if(result.rows.length===0){
            return res.status(404).json({message:"Notification not found."})
        }

        return res.status(200).json(result.rows[0])
    }
    catch(error){
        console.log(error)
        return res.status(500).json({message:"Could not mark the notification."})
    }
}

//mark all the notifcations as read 

export const markAllNotificationsRead=async(req:Request,res:Response)=>{
    try{
        const user_id=res.locals.userId 

        await connectionPool.query(
            "UPDATE notifications SET is_read=TRUE WHERE user_id=$1",[user_id]
        )
        return res.status(200).json({message:"All notifications are marked as read."})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({message:"Could not update the notifications."})
    }
}