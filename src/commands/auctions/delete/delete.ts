import { SlashCommandSubcommandBuilder } from "discord.js";
import "./interactionListeners/action-buttons.js";
import "./interactionListeners/auctionID-autocomplete.js";
import "./interactionListeners/base.js";

export default new SlashCommandSubcommandBuilder()
    .setName("delete")
    .setDescription("Delete an auction")
    .addStringOption((option) =>
        option
            .setName("auction")
            .setDescription("The ID of the auction to delete")
            .setRequired(true)
            .setAutocomplete(true)
    );


