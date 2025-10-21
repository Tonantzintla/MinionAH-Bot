import { client } from "$src/discord/client";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import { ComponentType, TextInputBuilder, TextInputStyle } from "discord.js";
import PriceCheckSequence from "../utils/PriceCheckSequence";

/**
 * Decodes pagination button interactions and navigates to the appropriate page.
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("price-check:page")) return;
  try {
    if (await checkMaintenanceMode(interaction, true)) return;
    const action = interaction.customId.split(":")[2] as
      | "previous"
      | "next"
      | "navigate-offset"
      | "navigate-absolute"
      | "go-to";

    const priceCheckSequence = PriceCheckSequence.getSequence({
      username: interaction.user.username
    });

    let currentPageOffset = 0,
      targetPage;
    switch (action) {
      case "previous":
        currentPageOffset = -1;
        break;
      case "next":
        currentPageOffset = 1;
        break;
      case "navigate-absolute":
        targetPage = parseInt(interaction.customId.split(":")[3] || "1");
        currentPageOffset = targetPage - priceCheckSequence.currentPageNumber;
        break;
      case "navigate-offset":
        currentPageOffset = parseInt(interaction.customId.split(":")[3] || "0");
        break;
      case "go-to": {
        await interaction.showModal({
          title: "Jump to Page",
          customId: "price-check:page:jump",
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                new TextInputBuilder()
                  .setCustomId("price-check:page:jump-input")
                  .setLabel("Page Number")
                  .setStyle(TextInputStyle.Short)
                  .setPlaceholder("Type the page number")
                  .setRequired(true)
              ]
            }
          ]
        });
        return;
      }
    }

    const { visualContainer } = await priceCheckSequence.navigateToPage(
      priceCheckSequence.currentPageNumber + currentPageOffset
    );
    await interaction.update({
      components: [visualContainer]
    });
  } catch (error) {
    console.error(error);
  }
});
