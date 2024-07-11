import {type UserReq, type LoginReq} from "../../types/type"
import db from "../db"
import { TokenService } from '../../services/token.service'
import { eq } from "drizzle-orm";
import { users } from "../schema";
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
        const error = new ErrorMiddleware( "Bad Request",'Registration unsuccessful-Email already in Use', 422);
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
      const error = new ErrorMiddleware('Bad Request', 'Authentication failed', 401);
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