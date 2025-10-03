import { maintenanceMode } from "$src/central.config";
import {
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageContextMenuCommandInteraction,
  MessageFlags,
  ModalSubmitInteraction,
  TextDisplayBuilder,
  UserContextMenuCommandInteraction
} from "discord.js";

type InteractionType =
  | ChatInputCommandInteraction<CacheType>
  | MessageContextMenuCommandInteraction<CacheType>
  | UserContextMenuCommandInteraction<CacheType>
  | ButtonInteraction<CacheType>
  | ModalSubmitInteraction<CacheType>;

const maintenanceContainer = new ContainerBuilder()
  .setAccentColor(0x262626)
  .addTextDisplayComponents(
    new TextDisplayBuilder({
      content: [
        "### MinionAH Bot is currently in maintenance mode",
        "",
        "The bot is currently undergoing maintenance. Please check back later."
      ].join("\n")
    })
  );

export default async function checkMaintenanceMode(
  interaction: InteractionType,
  preventReply?: boolean
) {
  if (maintenanceMode) {
    if (!preventReply) {
      await interaction.reply({
        components: [maintenanceContainer],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
      });
    }
    return true;
  }
  return false;
}
