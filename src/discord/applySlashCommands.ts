import commands from "$src/commands/commands";
import { REST, Routes } from "discord.js";

export default async function applySlashCommands() {
  const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN!);
  try {
    // delete all global commands
    await rest.put(Routes.applicationCommands(process.env.APP_ID!), {
      body: []
    });
    // register new global commands
    await rest.put(Routes.applicationCommands(process.env.APP_ID!), {
      body: commands
    });
    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
}
