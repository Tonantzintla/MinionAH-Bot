import e from "express";

export default function zodMW(schema: Zod.Schema<any>) {
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