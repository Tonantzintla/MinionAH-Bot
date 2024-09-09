import "./central.config.js"
import { client } from "./discord/client.js"

client.on("ready", (bot) => {
    console.log(`Bot ready! Process ID: ${process.pid}`);
    // await applySlashCommands(client);
})

client.login(process.env.DISCORD_TOKEN);