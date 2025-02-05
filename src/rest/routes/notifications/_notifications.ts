import e from "express";
import send from "./send.js";
import zodMW from "../../middleware/zodMW.js";
import notif_send_schemaZod from "../../zod/notifications/notif_send_schema.zod.js";

const notifications = e.Router();

notifications.post("/send", zodMW(notif_send_schemaZod),send);

export default notifications;