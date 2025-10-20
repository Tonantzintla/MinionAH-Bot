import { setMaintenanceMode } from "$src/central.config";
import { client } from "$src/discord/client";
import { SlashCommandBuilder } from "discord.js";

export default new SlashCommandBuilder()
  .setName("maintenance")
  .setDescription(
    "Commands related to the integration of Discord with MinionAH"
  )
  .addBooleanOption((option) =>
    option
      .setName("enable")
      .setDescription("Set the maintenance mode status")
      .setRequired(true)
  );

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName !== "maintenance") return;
  if (interaction.user.id !== process.env.ADMIN_ID) {
    return await interaction.reply({
      content: "You are not authorized to use this command",
      ephemeral: true
    });
  }
  try {
    if (interaction.options.get("enable")?.value === null) {
      await interaction.reply({
        content: "Please specify whether to enable or disable maintenance mode",
        ephemeral: true
      });
      return;
    }
    const enable = interaction.options.get("enable")?.value as boolean;
    if (enable) {
      await interaction.reply({
        content: "Maintenance mode enabled",
        ephemeral: true
      });
      client.user?.setPresence({
        activities: [{ name: "MinionAH is in maintenance mode" }],
        status: "dnd"
      });
    } else {
      await interaction.reply({
        content: "Maintenance mode disabled",
        ephemeral: true
      });
      client.user?.setPresence({
        activities: [
          {
            name: "Vibing with MinionAH"
          }
        ],
        status: "online"
      });
    }
    setMaintenanceMode(enable);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true
    });
  }
});
