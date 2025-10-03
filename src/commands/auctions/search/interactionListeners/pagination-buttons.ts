import { client } from "$src/discord/client";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import { ComponentType, TextInputBuilder, TextInputStyle } from "discord.js";
import SearchSequence from "../utils/SearchSequence";

/**
 * Decodes pagination button interactions and navigates to the appropriate page.
 */
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("auctions:search:page")) return;
    try {
        if (await checkMaintenanceMode(interaction, true)) return;
        const action = interaction.customId.split(":")[3] as
            | "previous"
            | "next"
            | "go-to";

        let currentPageOffset = 0;
        switch (action) {
            case "previous":
                currentPageOffset = -1;
                break;
            case "next":
                currentPageOffset = 1;
                break;
            case "go-to": {
                await interaction.showModal({
                    title: "Jump to Page",
                    customId: "auctions:search:page:jump",
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                new TextInputBuilder()
                                    .setCustomId("auctions:search:page:jump-input")
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

        const searchSequence = SearchSequence.getSequence({ username: interaction.user.username });
        const { visualContainer } = await searchSequence.navigateToPage(searchSequence.currentPageNumber + currentPageOffset);
        await interaction.update({
            components: [visualContainer]
        });
    } catch (error) {
        console.error("Error sending maintenance mode message:", error);
    }
})