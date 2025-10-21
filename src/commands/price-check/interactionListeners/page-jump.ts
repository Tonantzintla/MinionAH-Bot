import { client } from "$src/discord/client";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import { MessageFlags } from "discord.js";
import PriceCheckSequence from "../utils/PriceCheckSequence";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("price-check:page:jump")) return;
  try {
    if (await checkMaintenanceMode(interaction)) return;
    const pageInput = interaction.fields.getTextInputValue(
      "price-check:page:jump-input"
    );
    const pageNumber = parseInt(pageInput);
    const priceCheckSequence = PriceCheckSequence.getSequence({
      username: interaction.user.username
    });
    const { visualContainer } =
      await priceCheckSequence.navigateToPage(pageNumber);
    await interaction.reply({
      components: [visualContainer],
      flags: [MessageFlags.IsComponentsV2]
    });
  } catch (error) {
    console.error("Error handling page jump interaction:", error);
  }
});
