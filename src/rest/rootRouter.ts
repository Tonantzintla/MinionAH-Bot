import e from "express";
import health from "./health.js";
import notifications from "./routes/notifications/notifications-router.js";

const rootRouter = e.Router();

rootRouter.use("/notifications", notifications);
rootRouter.get("/health", health);

export default rootRouter;
