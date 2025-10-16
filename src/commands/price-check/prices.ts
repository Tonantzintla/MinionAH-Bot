import { SlashCommandBuilder } from "discord.js";
import "./interactionListeners/base.js";
import "./interactionListeners/page-jump.js";
import "./interactionListeners/pagination-buttons.js";

export default new SlashCommandBuilder()
    .setName("prices")
    .setDescription("Get the price for a minion. Or all of them!")
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("The type of minion you want to check the price for.")
            .setRequired(false)
    )
    .addIntegerOption((option) =>
        option
            .setName("tier")
            .setDescription("The tier of the minion you want to check the price for.")
            .setRequired(false)
            .addChoices([
                ...Array.from({ length: 12 }).map((_, tier) => ({
                    name: `Tier ${tier + 1}`,
                    value: tier + 1
                }))
            ])
    );