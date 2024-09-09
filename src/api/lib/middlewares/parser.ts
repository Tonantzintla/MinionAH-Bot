import { NextFunction, Request, Response } from "express";
import zod, { ZodObject, ZodRawShape } from "zod";

export default function zodParserMW<T extends ZodObject<ZodRawShape>>(
  schema: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.errors,
      });
    }

    req.body = result.data;
    next();
  };
}
