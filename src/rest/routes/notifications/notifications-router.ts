import zodMW from "$rest/middleware/zodMW.js";
import notif_send_schemaZod from "$rest/zod/notifications/notif_send_schema.zod.js";
import notif_expiring_auctions_schemaZod from "$src/rest/zod/notifications/notif_expiring_auctions_schema.zod.js";
import notif_test_schemaZod from "$src/rest/zod/notifications/notif_test_schema.zod.js";
import e from "express";
import expiring_auctions from "./expiring_auctions.js";
import send from "./send.js";
import test from "./test.js";

const notifications = e.Router();

notifications.post("/send", zodMW(notif_send_schemaZod), send);
notifications.post("/test", zodMW(notif_test_schemaZod), test);
notifications.post(
  "/expiring_auctions",
  zodMW(notif_expiring_auctions_schemaZod),
  expiring_auctions
);

export default notifications;
