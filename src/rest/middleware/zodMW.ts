import e from "express";
import { ZodSchema } from "zod";

/**
 * constructs middleware for a route,
 * validating the request body against a Zod schema
 * @param schema the schema to use
 * @returns void - it accepts the request if it matches the schema,
 * otherwise it returns a 400 Bad Request response
 */
export default function zodMW(schema: ZodSchema<unknown>) {
  return async (req: e.Request, res: e.Response, next: e.NextFunction) => {
    try {
      const data = schema.parse(req.body);
      req.body = data;
      next();
    } catch (error) {
      console.error(error);
      res.status(400).send("Bad Request");
    }
  };
}
