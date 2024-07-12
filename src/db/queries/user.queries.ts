import {type UserReq, type LoginReq, type UserCourseReq} from "../../types/type"
import db from "../db"
import { TokenService } from '../../services/token.service'
import { eq } from "drizzle-orm";
import { users, userCourses } from "../schema";
import bcrypt from "bcryptjs"
import { ErrorMiddleware } from "../../middlewares/error.middleware"


export const createUser = async(body:UserReq) => {

    const password = await bcrypt.hash(body.password, 10)
    

    const newUser = {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password,
        phone: body.phone 
    }



    const checkUser = await db
                            .select()
                            .from(users)
                            .where(eq(users.email, body.email))

    // console.log(checkUser)
  

    if(checkUser.length > 0){
        const error = new ErrorMiddleware( "Bad Request",'Email already in Use', 422);
        return error
    }

    try{    
        const [user] = await db.insert(users).values(newUser).returning()
        
        const accessToken = TokenService.generateAccessToken(user.id, "45m");
        return {user,accessToken}

    }catch(err){
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }

}

export const login = async (req: LoginReq) => {
  try {
    const user = await db.select().from(users).where(eq(users.email, req.email)).execute()

    if (user.length  <= 0 || !user ) {
      const error = new ErrorMiddleware('Bad Request', 'No such user exists, please sign up', 401);
      return error;
    }

    const result = await bcrypt.compare(req.password, user[0].password as string);

    if (!result) {
      const error = new ErrorMiddleware('Bad Request', 'Invalid username or password', 401);
      return error;
    }

    const accessToken = TokenService.generateAccessToken(user[0].id, '15m');
    const refreshToken = TokenService.generateRefreshToken(user[0].id, '7d');

    await TokenService.saveRefreshToken(user[0].id, refreshToken);

    return {
      user: {
        userId: user[0].id,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        email: user[0].email,
        phone: user[0].phone,
      },
      accessToken,
      refreshToken,
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
  }
};

export const getUserById = async(userId:string) =>{
    try{
        const [user] = await db.select().from(users).where(eq(users.id, userId)).execute()
                                                    
        if(!user){
            const error = new ErrorMiddleware( "Bad Request",'No such user exists please sign up', 401);
            return error
        }

        return user
    }catch(err){
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getUserCourses = async(id:string) => {
    try{
        const userCourses = await db.select().from(users).where(eq(users.id, id)).execute()

        if(userCourses.length <= 0){
            const error = new ErrorMiddleware( "Bad Request",'No such user exists please sign up', 401);
            return error
        }
        
        return userCourses
    }catch(err){
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const updateUserDetails = async(req:UserReq, id:string) => {
    try{
         const user = await db.select().from(users).where(eq(users.id, id)).execute()

        if(user.length <= 0){
            const error = new ErrorMiddleware( "Bad Request",'No such user exists please sign up', 401);
            return error
        }


        const updatedUser = await db.update(users).set(req).where(eq(users.id, id)).returning()

        return updatedUser
    }catch(err){
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const deleteUser = async(id:string) =>{
    try{

        const user = await db.select().from(users).where(eq(users.id, id)).execute()

        if(user.length <= 0){
            const error = new ErrorMiddleware( "Bad Request",'No such user exists please sign up', 401);
            return error
        }

        const deletedUser = await db.delete(users).where(eq(users.id, id)).returning()

        return deletedUser
    }catch(err){
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getAllUsers = async() => {
    try{
        const allUser = await db.select().from(users).execute()

        return allUser
    }catch(err){
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const enrollCourse = async(req:UserCourseReq) => {
    try{
        const user = await db.select().from(users).where(eq(users.id, req.userId)).execute()

        if(user.length <= 0){
            const error = new ErrorMiddleware( "Bad Request",'No such user exists please sign up', 401);
            return error
        }

        const course = await db.select().from(users).where(eq(users.id, req.courseId)).execute()

        if(course.length <= 0){
            const error = new ErrorMiddleware( "Bad Request",'No such course exists', 401);
            return error
        }

        const userCourse = await db.insert(userCourses).values(req).returning() 

        return userCourse
        
    }catch(err){
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}