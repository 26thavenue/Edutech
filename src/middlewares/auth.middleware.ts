import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorMiddleware } from './error.middleware'; 
import db from "../db/db"
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret';

export const authMiddleware = async(req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json(new ErrorMiddleware('Unauthorized', 'No token provided', 401));
  }

  try {
   
        const payload= jwt.verify(token as string, ACCESS_TOKEN_SECRET as string) as any

        // console.log('Searching for user with id:', payload);

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.userId))  
            .then(rows => rows[0]);


        // console.log(user)

        if(!user){
            return next(res.json({message: 'Unauthorized User '}).status(401))
        }

        req.user = user
        next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(new ErrorMiddleware('Unauthorized', 'Token expired', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(new ErrorMiddleware('Unauthorized', ` Invalid token - ${error}`, 401));
    }
    
    return res.status(500).json(new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500));
  }
};

