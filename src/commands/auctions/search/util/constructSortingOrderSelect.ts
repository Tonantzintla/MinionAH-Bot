import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export default function constructSortingOrderSelect(currentSorting?: "asc" | "desc") {
    const options = [
        new StringSelectMenuOptionBuilder()
            .setLabel("Ascending")
            .setValue("asc")
            .setDefault(currentSorting === "asc")
            .setDescription("See the oldest auctions first")
            .setEmoji("⬆️"),
        new StringSelectMenuOptionBuilder()
            .setLabel("Descending")
            .setValue("desc")
            .setDefault(currentSorting === "desc")
            .setDescription("See the newest auctions first")
            .setEmoji("⬇️"),
        new StringSelectMenuOptionBuilder()
            .setLabel("No Sorting")
            .setValue("none")
            .setDefault(!currentSorting)
            .setDescription("See whatever the database returns first")
            .setEmoji("↕️")
    ];
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("auctions:search:sort")
            .setPlaceholder("Select the sorting order")
            .addOptions(options)
            .setMaxValues(1)
            .setMinValues(1)
    );
}