import { REST, Routes } from "discord.js";
import { client } from "./client.js";
import commands from "../commands/commands.js";

export default async function applySlashCommands() {
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);
    try {
        for (const guild of client.guilds.cache.values()) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.APP_ID!, guild.id),
                { body: commands },
            );
        }
        console.log("Successfully registered application commands.");
    } catch (error) {
        console.error(error);
    }
}