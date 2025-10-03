import getSubcommand from "$lib/getSubcommand";
import { client } from "$src/discord/client";
import checkMaintenanceMode from "$src/shared/checkMaintenanceMode";
import { MessageFlags, PrimaryEntryPointCommandInteraction } from "discord.js";
import SearchSequence from "../util/SearchSequence";
import applyValueCollectorToSortingOrderSelector from "../util/applyValueCollectorToSortingOrderSelector";

/**
 * Listens for the /auctions search command and initiates the search sequence.
 * Returns the first page
 */
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction instanceof PrimaryEntryPointCommandInteraction) return;
    if (
        interaction.commandName !== "auctions" ||
        getSubcommand(interaction) !== "search"
    )
        return;

    try {
        if (await checkMaintenanceMode(interaction)) return;
        const searchSequence = SearchSequence.getSequence({
            username: interaction.user.username,
            minionType: interaction.options.get("minion_type")?.value as string || undefined,
            minionTier: interaction.options.get("minion_tier")?.value as number || undefined,
            explicitlyCreate: true
        });
        const reply = await interaction.reply({
            components: [
                (await searchSequence.getCurrentPage()).visualContainer
            ],
            flags: [MessageFlags.IsComponentsV2]
        });
        applyValueCollectorToSortingOrderSelector(reply)
    } catch (error) {
        console.error("Error sending maintenance mode message:", error);
    }
});

