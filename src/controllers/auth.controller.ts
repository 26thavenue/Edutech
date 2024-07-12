import { type Request, type Response } from "express";
import * as authService from "../db/queries/user.queries"
import { ErrorMiddleware } from "../middlewares/error.middleware"

export const register =  async(req:Request,res: Response) => {
    
    const data = await authService.createUser(req.body)
    
    if(data instanceof ErrorMiddleware){
        return res.status(data.statusCode).json({status: data.status,message: data.message, statusCode: data.statusCode})
    }

    const response ={
        "status": "success",
        "message": "Registration successful",
        "data":{
            "accessToken": data.accessToken,
            "user": {
                "userId": data.user.id,
                "firstName": data.user.firstName,
                "lastName": data.user.lastName,
                "email": data.user.email,
                "phone": data.user.phone
            }
            
        }
    }
    

    res.status(201).json(response)


}

export const login =  async(req:Request,res: Response) => {
    const data = await authService.login(req.body)

    if(data instanceof ErrorMiddleware){
        return res.status(data.statusCode).json({status: data.status,message: data.message, statusCode: data.statusCode})
    }
    
    const response ={
        "status": "success",
        "message": "Login successful",
        "data":{
            "accessToken": data.accessToken,
            "user": {
                "userId": data.user.userId,
                "firstName": data.user.firstName,
                "lastName": data.user.lastName,
                "email": data.user.email,
                "phone": data.user.phone
            }
            
        }
    }
    

    res.status(200).json(response)
    
}

export const logOut = async() =>{
    
}