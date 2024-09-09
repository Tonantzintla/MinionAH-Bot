import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { client } from "../../discord/client.js";

const commands = [
    new SlashCommandBuilder()
        .setName("prices")
        .setDescription("Get the price")
].map(command => command.toJSON());

export default async function applySlashCommands() {
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!);
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