import { kv, prisma } from "$src/central.config";
import { client } from "$src/discord/client";
import genericErrorContainer from "$src/shared/displayContainers/genericErrorContainer";
import { MessageFlags } from "discord.js";
import auctionsDeleteComponents from "../util/auctionsDeleteComponents";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("auction:delete:")) return;
  try {
    const action = interaction.customId.split(":")[2];
    const targetAuctionID = kv.get<string>(
      `auction:delete:pending:${interaction.user.username}`
    );
    if (!targetAuctionID) {
      await interaction.reply({
        components: [
          auctionsDeleteComponents.static.pendingDeletionExpiredDisplayContainer
        ],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
      });
      return;
    }
    switch (action) {
      case "confirm": {
        await prisma.auction.delete({
          where: {
            id: targetAuctionID
          }
        });
        kv.del(`auction:delete:pending:${interaction.user.username}`);
        await interaction.reply({
          components: [
            auctionsDeleteComponents.static
              .auctionDeletionSuccessDisplayContainer
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
        break;
      }
      case "cancel": {
        kv.del(`auction:delete:pending:${interaction.user.username}`);
        await interaction.reply({
          components: [
            auctionsDeleteComponents.static
              .auctionDeletionCancelledDisplayContainer
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error(
      "Error handling auction delete action button interaction:",
      error
    );
    await interaction.reply({
      components: [genericErrorContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
    });
  }
});
