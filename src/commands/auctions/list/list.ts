import getSubcommand from "$lib/getSubcommand";
import { client } from "$src/discord/client";
import genericErrorContainer from "$src/shared/displayContainers/genericErrorContainer";
import getLinkedMinionAHUser from "$src/shared/user/getLinkedMinionAHUser";
import checkMaintenanceMode from "$src/shared/utils/checkMaintenanceMode";
import { MessageFlags, PrimaryEntryPointCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { noLinkedMinionAHAccountFoundDisplayContainer } from "../create/util/staticComponents";
import applyValueCollectorToSortingOrderSelector from "../search/utils/applyValueCollectorToSortingOrderSelector";
import SearchSequence from "../search/utils/SearchSequence";
import getMyAuctionsConstructor from "./util/getMyAuctionsConstructor";

export default new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("List your auctions");

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction instanceof PrimaryEntryPointCommandInteraction) return
    if (interaction.commandName !== "auctions") return;
    if (getSubcommand(interaction) !== "list") return;

    try {
        if (await checkMaintenanceMode(interaction)) return;
        const linkedUser = await getLinkedMinionAHUser(interaction.user.username);
        if (!linkedUser) {
            await interaction.reply({
                components: [noLinkedMinionAHAccountFoundDisplayContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            })
            return
        }
        const searchSequence = SearchSequence.getSequence({
            username: interaction.user.username,
            explicitlyCreate: true,
            overrideDefaultAuctionGetter: getMyAuctionsConstructor(linkedUser.user.id)
        })

        const reply = await interaction.reply({
            components: [
                (await searchSequence.getCurrentPage()).visualContainer
            ],
            flags: [MessageFlags.IsComponentsV2]
        });
        applyValueCollectorToSortingOrderSelector(reply)
    } catch (error) {
        console.error("Error sending maintenance mode message:", error);
        await interaction.reply({
            components: [genericErrorContainer],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        })
    }
})