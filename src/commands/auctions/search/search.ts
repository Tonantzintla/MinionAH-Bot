import { SlashCommandSubcommandBuilder } from "discord.js";
import "./interactionListeners/base.js";
import "./interactionListeners/page-jump.js";
import "./interactionListeners/pagination-buttons.js";

export default new SlashCommandSubcommandBuilder()
    .setName("search")
    .setDescription("Search accross the auction house")
    .addStringOption((option) =>
        option
            .setName("minion_type")
            .setDescription("The type of the minion to search for")
            .setRequired(false)
            .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("minion_tier")
            .setDescription("The tier of the minions to search for")
            .setRequired(false)
            .addChoices([
                ...Array.from({ length: 12 }).map((_, tier) => ({
                    name: `Tier ${tier + 1}`,
                    value: tier + 1
                }))
            ])
    );
