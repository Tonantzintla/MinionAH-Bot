import { ActionRowBuilder, CacheType, Interaction, parseEmoji, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { client } from "../../discord/client.js";
import getSubcommand from "../../lib/getSubcommand.js";
import { Auction } from "../../lib/types/auction.js";
import parseMinionType from "../../lib/auctions/parseMinionType.js";
import resolveMinionEmoji from "../../lib/resolveMinionEmoji.js";

export default new SlashCommandSubcommandBuilder()
    .setName("delete")
    .setDescription("Delete one of your auctions")

interface AuctionDeletionOptions extends Auction.AuctionOptions {
    auctionID: string;
}

const repeatArray = <T>(array: T[], times: number): T[] => {
    const newArray: T[] = [];
    for (let i = 0; i < times; i++) {
        newArray.push(...array);
    }
    return newArray;
}

async function getAuctions(discordID: string): Promise<AuctionDeletionOptions[]> {
    // todo
    return repeatArray(
        [
            {
                auctionID: "1",
                amount: 100,    
                freeWill: true,
                mithrilInfused: true,
                price: 1000,
                tier: 1,
                type: "ACACIA_GENERATOR_1"
            },
        ],
        30
    ).map((auction, index) => ({ ...auction, auctionID: `${index + 1}` })).slice(0, 25)
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== "auctions" || getSubcommand(interaction) !== "delete") return;
    try {
        const auctions = await getAuctions(interaction.user.id);
        if (auctions.length === 0) {
            await interaction.reply({ content: "You don't have any auctions to delete!", ephemeral: true });
            return;
        }
        const systemEmojis = await client.application?.emojis.fetch()
        if (!systemEmojis) {
            await interaction.reply({ content: "Could not fetch emojis...? Hey, please contact @andriotis. He'll get to it immediately", ephemeral: true });
            return;
        }
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`auctions_delete:selector:${interaction.user.id}`)
            .setPlaceholder("Select an auction to delete")
            .addOptions(
                auctions.map(auction => 
                    new StringSelectMenuOptionBuilder()
                        .setValue(auction.auctionID)
                        .setEmoji(resolveMinionEmoji(auction.type, systemEmojis))
                        .setLabel(`${auction.amount}x ${parseMinionType(auction.type)} for ${auction.price.toLocaleString()} coins`)
                        .setDescription(`Tier ${auction.tier} | ${auction.freeWill ? "Free Will" : ""} | ${auction.mithrilInfused ? "Mithril Infused" : ""}`)
                )
            );
            
        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await interaction.reply({ content: "Select an auction to delete", components: [actionRow], ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
})