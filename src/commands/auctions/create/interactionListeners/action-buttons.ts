import { client } from "$src/discord/client";
import genericErrorContainer from "$src/shared/displayContainers/genericErrorContainer";
import { MessageFlags } from "discord.js";
import AuctionCreator from "../util/AuctionCreator";
import { cancelledAuctionCreationDisplayContainer, confirmedAuctionCreationDisplayContainer } from "../util/staticComponents";

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("auction:create:")) return;
    try {
        const action = interaction.customId.split(":")[2];

        switch (action) {
            case "confirm": {
                await AuctionCreator.confirmCreation(interaction.user.username);
                await interaction.reply({
                    components: [confirmedAuctionCreationDisplayContainer],
                    flags: [MessageFlags.IsComponentsV2]
                })
                break;
            }
            case "cancel":
                AuctionCreator.cancelCreation(interaction.user.username);
                await interaction.reply({
                    components: [cancelledAuctionCreationDisplayContainer],
                    flags: [MessageFlags.IsComponentsV2]
                })
                break;
            default:
                break;
        }
    } catch (error) {
        console.error("Error handling auction create action button interaction:", error);
        await interaction.reply({ components: [genericErrorContainer], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }
})