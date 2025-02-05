import { NextFunction, Request, Response } from "express";

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.headers.authorization?.trim() == process.env.API_KEY) return next();
  return res.status(401).send("Unauthorized request.");
}
