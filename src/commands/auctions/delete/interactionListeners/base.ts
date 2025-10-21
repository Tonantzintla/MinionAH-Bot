import getSubcommand from "$lib/getSubcommand";
import { kv, prisma } from "$src/central.config";
import { client } from "$src/discord/client";
import genericErrorContainer from "$src/shared/displayContainers/genericErrorContainer";
import noLinkedMinionAHAccountFoundDisplayContainer from "$src/shared/displayContainers/noLinkedMinionAHAccountFoundDisplayContainer";
import getLinkedMinionAHUser from "$src/shared/user/getLinkedMinionAHUser";
import { MessageFlags, PrimaryEntryPointCommandInteraction } from "discord.js";
import auctionsDeleteComponents from "../util/auctionsDeleteComponents";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction instanceof PrimaryEntryPointCommandInteraction) return;
  if (
    interaction.commandName !== "auctions" ||
    getSubcommand(interaction) !== "delete"
  )
    return;

  try {
    const auctionID = interaction.options.get("auction", true).value as string;
    const linkedUser = await getLinkedMinionAHUser(interaction.user.username);
    if (!linkedUser) {
      await interaction.reply({
        components: [noLinkedMinionAHAccountFoundDisplayContainer],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
      });
      return;
    }

    const auction = await prisma.auction.findUnique({
      where: {
        id: auctionID,
        user_id: linkedUser.user.id
      }
    });
    if (!auction) {
      await interaction.reply({
        components: [
          auctionsDeleteComponents.static.auctionNotFoundDisplayContainer
        ],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
      });
      return;
    }

    const confirmationComponent =
      await auctionsDeleteComponents.constructors.constructAuctionDeleteConfirmationDisplayContainer(
        auction
      );
    if (!confirmationComponent)
      throw new Error(
        "Failed to construct auction delete confirmation component"
      );

    kv.set(
      `auction:delete:pending:${interaction.user.username}`,
      auction.id,
      15 * 60
    );

    await interaction.reply({
      components: [confirmationComponent],
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
