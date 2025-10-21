import { client } from "$src/discord/client";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import { MessageFlags } from "discord.js";
import SearchSequence from "../utils/SearchSequence";
import applyValueCollectorToSortingOrderSelector from "../utils/applyValueCollectorToSortingOrderSelector";

/**
 * Processes the input from the page jump modal and navigates to the specified page.
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("auctions:search:page:jump")) return;
  try {
    if (await checkMaintenanceMode(interaction)) return;
    const pageInput = interaction.fields.getTextInputValue(
      "auctions:search:page:jump-input"
    );
    const pageNumber = parseInt(pageInput);
    const searchSequence = SearchSequence.getSequence({
      username: interaction.user.username
    });
    const { visualContainer } = await searchSequence.navigateToPage(pageNumber);
    const reply = await interaction.reply({
      components: [visualContainer],
      flags: [MessageFlags.IsComponentsV2]
    });
    applyValueCollectorToSortingOrderSelector(reply);
  } catch (error) {
    console.error("Error handling page jump interaction:", error);
  }
});
