import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default function constructPagination({ currentPage, totalPages }: {
    currentPage: number;
    totalPages: number;
}) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setLabel("⬅️ Previous Page")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 1)
            .setCustomId(`auctions:search:page:previous`),
        new ButtonBuilder()
            .setLabel("🔢 Go to Page")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`auctions:search:page:go-to`),
        new ButtonBuilder()
            .setLabel("Next Page ➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages)
            .setCustomId(`auctions:search:page:next`)
    );
}