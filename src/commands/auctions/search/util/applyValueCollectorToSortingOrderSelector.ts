import { ComponentType, InteractionResponse } from "discord.js";
import SearchSequence from "./SearchSequence";

export default function applyValueCollectorToSortingOrderSelector(reply: InteractionResponse<boolean>) {
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.customId === "auctions:search:sort",
    })

    collector.on("collect", async (interaction) => {
        try {
            const sortingOrder = interaction.values[0] as "asc" | "desc" | "none";
            const searchSequence = SearchSequence.getSequence({ username: interaction.user.username });
            searchSequence.changeSortingOrder(sortingOrder);
            const { visualContainer } = await searchSequence.getCurrentPage();
            await interaction.update({
                components: [visualContainer]
            })
        } catch (error) {
            console.error(error);
        }
    })
}