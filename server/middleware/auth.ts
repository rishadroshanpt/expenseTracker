import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}
