import e from "express";
import health from "./health.js";
import notifications from "./routes/notifications/_notifications.js";

const rootRouter = e.Router();

rootRouter.use("/notifications", notifications);
rootRouter.get("/health", health);

export default rootRouter;
