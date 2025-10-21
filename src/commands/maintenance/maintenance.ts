import { setMaintenanceMode } from "$src/central.config";
import { client } from "$src/discord/client";
import genericErrorContainer from "$src/shared/displayContainers/genericErrorContainer";
import unauthorizedCommandContainer from "$src/shared/displayContainers/unauthorizedCommandContainer";
import {
  MessageFlags,
  PrimaryEntryPointCommandInteraction,
  SlashCommandBuilder
} from "discord.js";

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
  if (interaction instanceof PrimaryEntryPointCommandInteraction) return;
  if (interaction.commandName !== "maintenance") return;

  if (interaction.user.id !== process.env.ADMIN_ID) {
    return await interaction.reply({
      components: [unauthorizedCommandContainer],
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
    });
  }
  try {
    const enable = interaction.options.get("enable", true)?.value as boolean;
    if (enable) {
      await interaction.reply({
        content: "Maintenance mode enabled",
        flags: [MessageFlags.Ephemeral]
      });
      client.user?.setPresence({
        activities: [{ name: "MinionAH is in maintenance mode" }],
        status: "dnd"
      });
    } else {
      await interaction.reply({
        content: "Maintenance mode disabled",
        flags: [MessageFlags.Ephemeral]
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
      components: [genericErrorContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
    });
  }
});
