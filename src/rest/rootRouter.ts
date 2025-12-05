import e from "express";
import health from "./health.js";
import notifications from "./routes/notifications/notifications-router.js";
import authMiddleware from "./middleware/auth.js";

const rootRouter = e.Router();

rootRouter.use("/notifications", authMiddleware, notifications);
rootRouter.get("/health", health);

export default rootRouter;
