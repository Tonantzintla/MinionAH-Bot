import getSubcommand from "$lib/getSubcommand.js";
import { maintenanceMode } from "$src/central.config";
import { client } from "$src/discord/client.js";
import maintenanceModeEmbed from "$src/discord/maintenanceModeEmbed";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandSubcommandBuilder
} from "discord.js";

export default new SlashCommandSubcommandBuilder()
  .setName("link")
  .setDescription("Link your Discord account with your MinionAH account");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (
    interaction.commandName !== "discord" ||
    getSubcommand(interaction) !== "link"
  )
    return;

  try {
    if (maintenanceMode)
      return await interaction.reply({
        embeds: [maintenanceModeEmbed],
        ephemeral: true
      });
    const embed = new EmbedBuilder()
      .setTitle("✅ Link your Discord account to MinionAH")
      .setColor("#262626")
      .setDescription(
        "To link your Discord account to MinionAH, click the button below"
      );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Link Discord Account")
        .setStyle(ButtonStyle.Link)
        .setURL("https://minionah.com/profile/settings")
    );

    await interaction.reply({
      embeds: [embed],
      components: [actionRow],
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true
    });
  }
});
