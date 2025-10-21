import getSubcommand from "$lib/getSubcommand";
import { client } from "$src/discord/client";
import getLinkedMinionAHUser from "$src/shared/user/getLinkedMinionAHUser";
import { MessageFlags, PrimaryEntryPointCommandInteraction } from "discord.js";
import AuctionCreator from "../util/AuctionCreator";
import {
  invalidAuctionCreateDisplayContainer,
  noLinkedMinionAHAccountFoundDisplayContainer
} from "../util/staticComponents";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction instanceof PrimaryEntryPointCommandInteraction) return;
  if (interaction.commandName !== "auctions") return;
  if (getSubcommand(interaction) !== "create") return;

  // we dont do anything with this object. but its existence validates
  // the... existence of a link between the initiating discord user and a MinionAH user
  const linkedMinionAHUser = await getLinkedMinionAHUser(
    interaction.user.username
  );
  if (!linkedMinionAHUser) {
    await interaction.reply({
      components: [noLinkedMinionAHAccountFoundDisplayContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
    });
    return;
  }
  try {
    const creator = new AuctionCreator(interaction);
    await interaction.reply({
      components: [await creator.getConfirmationDisplayContainer()],
      flags: [MessageFlags.IsComponentsV2]
    });
  } catch (error) {
    console.error("Error handling auction create command interaction:", error);
    await interaction.reply({
      components: [invalidAuctionCreateDisplayContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
    });
  }
});
