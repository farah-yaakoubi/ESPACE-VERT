// src/lib/auth.ts
import jwt    from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JwtPayload } from "../types";

const JWT_SECRET         = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken  = (p: JwtPayload) => jwt.sign(p, JWT_SECRET,         { expiresIn: "30m" });
export const generateRefreshToken = (p: JwtPayload) => jwt.sign(p, JWT_REFRESH_SECRET, { expiresIn: "7d"  });

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try { return jwt.verify(token, JWT_SECRET) as JwtPayload; } catch { return null; }
};
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try { return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload; } catch { return null; }
};

export const hashPassword    = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
};
