import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs"
import db from "../db/db"
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';

interface TokenPayload {
  userId: string;
}

export class TokenService {
  public static generateAccessToken(userId: string, expiresIn: string): string {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn });
  }

  public static generateRefreshToken(userId: string, expiresIn: string): string {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn });
  }

  public static async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await db.update(users).set({ refreshToken: hashedToken }).where(eq(users.id, userId)).execute()
  }

  public static async getRefreshTokenByUserId(userId: string): Promise<string | null> {
    const userArr = await db.select().from(users).where(eq(users.id, userId)).execute()
    const user = userArr[0]
    return user ? user.refreshToken : null;
  }

  public static async deleteRefreshToken(userId: string): Promise<void> {
    const hashedToken = null
    await db.update(users).set({ refreshToken: hashedToken }).where(eq(users.id, userId)).execute()
  }

  public static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  public static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}