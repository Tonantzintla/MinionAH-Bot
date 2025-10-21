import getSubcommand from "$lib/getSubcommand.js";
import { prisma } from "$src/central.config";
import { client } from "$src/discord/client.js";
import genericErrorContainer from "$src/shared/displayContainers/genericErrorContainer";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import {
  ContainerBuilder,
  MessageFlags,
  PrimaryEntryPointCommandInteraction,
  SeparatorSpacingSize,
  SlashCommandSubcommandBuilder
} from "discord.js";

export default new SlashCommandSubcommandBuilder()
  .setName("unlink")
  .setDescription("Unlink your Discord account from your MinionAH account");

const unlinkSuccessContainer = new ContainerBuilder()
  .addTextDisplayComponents(
    t => t.setContent("### ✅ Discord account unlinked from MinionAH"),
  )
  .addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large))
  .addTextDisplayComponents(
    t => t.setContent("Your Discord account has been successfully unlinked from your MinionAH account. If you wish to link it again in the future, you can use the `/discord link` command.")
  );

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction instanceof PrimaryEntryPointCommandInteraction) return;
  if (
    interaction.commandName !== "discord" ||
    getSubcommand(interaction) !== "unlink"
  )
    return;

  try {
    if (await checkMaintenanceMode(interaction)) return;
    await prisma.userOAuthProvider.delete({
      where: {
        id: interaction.user.id,
        provider: "discord"
      }
    });
    await interaction.reply({
      components: [unlinkSuccessContainer],
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      components: [genericErrorContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
    });
  }
});