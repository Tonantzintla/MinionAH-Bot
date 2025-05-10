import authMiddleware from "$rest/middleware/auth.js";
import rootRouter from "$rest/rootRouter.js";
import express from "express";
import cron from "node-cron";
import "./central.config.js";
import applySlashCommands from "./discord/applySlashCommands.js";
import { client } from "./discord/client.js";
import "./global-listeners/imports.js";

// --- express
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use(rootRouter);

// --- init
client.on("ready", async () => {
  console.log(`Bot ready! Process ID: ${process.pid}`);
  await applySlashCommands();
});

client.login(process.env.DISCORD_TOKEN);
app.listen(process.env.WEB_PORT, () =>
  console.log(`Server running on port ${process.env.WEB_PORT}`)
);

// --- heartbeat
cron.schedule("5 * * * *", async () => await fetch(process.env.HEARTBEAT_URL!));