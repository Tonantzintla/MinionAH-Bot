import "./central.config.js";
import { client } from "./discord/client.js";
import applySlashCommands from "./discord/applySlashCommands.js";
import api from "./api/index.js";

client.on("ready", async (bot) => {
  console.log(`Bot ready! Process ID: ${process.pid}`);
  await applySlashCommands();
});

client.login(process.env.DISCORD_TOKEN);
api.init();
