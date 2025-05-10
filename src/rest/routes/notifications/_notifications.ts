import zodMW from "$rest/middleware/zodMW.js";
import notif_send_schemaZod from "$rest/zod/notifications/notif_send_schema.zod.js";
import e from "express";
import send from "./send.js";
import test from "./test.js";
import notif_test_schemaZod from "$src/rest/zod/notifications/notif_test_schema.zod.js";

const notifications = e.Router();

notifications.post("/send", zodMW(notif_send_schemaZod),send);
notifications.post("/test", zodMW(notif_test_schemaZod), test)

export default notifications;