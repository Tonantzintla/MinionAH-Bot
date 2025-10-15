import e from "express";

export default (_: e.Request, res: e.Response) => { res.status(200).json({ status: "ok" }) }