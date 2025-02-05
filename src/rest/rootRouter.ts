import e from "express";
import notifications from "./routes/notifications/_notifications.js";

const rootRouter = e.Router();

rootRouter.use("/notifications", notifications)

export default rootRouter