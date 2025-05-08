import zodMW from "$rest/middleware/zodMW.js";
import notif_send_schemaZod from "$rest/zod/notifications/notif_send_schema.zod.js";
import e from "express";
import send from "./send.js";

const notifications = e.Router();

notifications.post("/send", zodMW(notif_send_schemaZod),send);

export default notifications;