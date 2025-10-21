import getSubcommand from "$lib/getSubcommand.js";
import { client } from "$src/discord/client.js";
import genericErrorContainer from "$src/shared/displayContainers/genericErrorContainer";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  PrimaryEntryPointCommandInteraction,
  SeparatorSpacingSize,
  SlashCommandSubcommandBuilder
} from "discord.js";

export default new SlashCommandSubcommandBuilder()
  .setName("link")
  .setDescription("Link your Discord account with your MinionAH account");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction instanceof PrimaryEntryPointCommandInteraction) return;
  if (
    interaction.commandName !== "discord" ||
    getSubcommand(interaction) !== "link"
  )
    return;

  try {
    if (await checkMaintenanceMode(interaction)) return;
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        t => t.setContent("### ✅ Link your Discord account to MinionAH"),
      )
      .addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large))
      .addTextDisplayComponents(
        t => t.setContent("To link your Discord account to MinionAH, click the button below. You will be redirected to your account page on MinionAH.com")
      )
      .addActionRowComponents(
        r => r.addComponents(
          new ButtonBuilder()
            .setLabel("Link Discord Account")
            .setStyle(ButtonStyle.Link)
            .setURL("https://minionah.com/profile/settings")
        )
      );
    await interaction.reply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2]
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      components: [genericErrorContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
    });
  }
});
