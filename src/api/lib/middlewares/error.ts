import { Response, Request, NextFunction } from "express";
export function JsonErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  next(err);
}

export function AllErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);
  res.status(500).json({ error: "Internal error." });
}
