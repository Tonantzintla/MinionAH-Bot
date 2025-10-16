import { client } from "$src/discord/client";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import { MessageFlags, PrimaryEntryPointCommandInteraction } from "discord.js";
import PriceCheckSequence from "../utils/PriceCheckSequence";

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    console.log(interaction.commandName)
    if (interaction.commandName !== "prices") return;
    if (interaction instanceof PrimaryEntryPointCommandInteraction) return;

    try {
        if (await checkMaintenanceMode(interaction)) return;

        const typeFilter = interaction.options.get("type")?.value as string | undefined;
        const tierFilter = interaction.options.get("tier")?.value as number | undefined;

        const priceCheckSequence = PriceCheckSequence.getSequence({
            username: interaction.user.username,
            minionType: typeFilter,
            minionTier: tierFilter,
            explicitlyCreate: true
        });

        await interaction.reply({
            components: [
                (await priceCheckSequence.getCurrentPage()).visualContainer
            ],
            flags: [MessageFlags.IsComponentsV2]
        })
    } catch (error) {
        console.error("Error handling price-check interaction:", error);
    }
})