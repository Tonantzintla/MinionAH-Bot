import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { Auction } from "../../lib/types/auction.js";
import { client } from "../../discord/client.js";
import getSubcommand from "../../lib/getSubcommand.js";
import formatMinionPrice from "../../lib/prices/formatMinionPrice.js";
import resolveMinionEmoji from "../../lib/resolveMinionEmoji.js";

interface DisplayableAuctions {
    minionType: string; // parsed: plaintext-displayable
    price: number;
    amount: number;
    created: number; // timestamp
    // stuff used on the backend
    system: {
        tier: number;
        fullType: string;
    }
}

const commandParams = {
    auctionsPerPage: 12
}

export default new SlashCommandSubcommandBuilder()
    .setName("search")
    .setDescription("Search accross the auction house")
    .addStringOption(option =>
        option.setName("minion_type")
            .setDescription("The type of the minion to search for")
            .setRequired(false)
            .setAutocomplete(true)
    )
    .addIntegerOption(option =>
        option.setName("minion_tier")
            .setDescription("The tier of the minions to search for")
            .setRequired(false)
            .addChoices([
                ...Array.from({ length: 12 }).map((_, tier) => ({
                    name: `Tier ${tier + 1}`,
                    value: tier + 1
                }))
            ])
    )

    // todo: remove this - just for mockup
    function generateAuctionData(count: number): DisplayableAuctions[] {
        const minionTypes = [
            "Cobblestone Minion", "Iron Minion", "Gold Minion", "Diamond Minion",
            "Lapis Minion", "Redstone Minion", "Emerald Minion", "Quartz Minion",
            "Obsidian Minion", "Glowstone Minion", "Gravel Minion", "Sand Minion"
        ];
    
        const auctions: DisplayableAuctions[] = [];
        for (let i = 0; i < count; i++) {
            const minionType = minionTypes[Math.floor(Math.random() * minionTypes.length)];
            const price = Math.floor(Math.random() * 10000) + 1000; // Random price between 1000 and 10999
            const created = Date.now() - Math.floor(Math.random() * 1000000000); // Random timestamp within the last ~11.5 days
            const tier = Math.floor(Math.random() * 12) + 1; // Random tier between 1 and 12
            const amount = Math.floor(Math.random() * 64) + 1; // Random amount between 1 and 64

            auctions.push({
                minionType,
                price,
                amount,
                created,
                system: {
                    tier,
                    fullType: "ACACIA_GENERATOR_1"
                }
            });
        }
    
        return auctions;
    }

// todo: change this to a real implementation
function displayableMutation(auctions: Auction.FetchedAuctionData[]): DisplayableAuctions[] {
    return generateAuctionData(commandParams.auctionsPerPage * 5)
}

async function getAuctions(page: number): Promise<{
    auctions: DisplayableAuctions[]
    minionSum: number
}> {
    const auctions: Auction.FetchedAuctionData[] = []
    return {
        auctions: displayableMutation(auctions).slice(page * commandParams.auctionsPerPage, commandParams.auctionsPerPage * (page + 1)),
        minionSum: 0
    }
}

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== "auctions" || getSubcommand(interaction) !== "search") return;

    try {
        const minionType = interaction.options.get("minion_type", false)?.value as string | undefined;
        const minionTier = interaction.options.get("minion_tier", false)?.value as number | undefined;
        const botEmojis = await client.application?.emojis.fetch()

        if (!botEmojis) {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            return;
        }

        const { auctions, minionSum } = await getAuctions(0);

        const descriptionFields = [
            `**Auctions:** ${auctions.length}`,
            `**Minions Found:** ${minionSum}`
        ]
        const embed = new EmbedBuilder()
            .setTitle("Auction Search")
            .setDescription("Here are the search results for the auctions you requested")
            .setColor("#2B2D31")
            .setDescription(descriptionFields.join("\n"))
            .addFields(auctions.map((auction, idx) => ({
                name: `${resolveMinionEmoji(auction.system.fullType, botEmojis)} ${auction.minionType}`,
                value: `Price: **${formatMinionPrice(auction.price)}**\nAmount: **${auction.amount}**\nCreated: ${`<t:${Math.floor(auction.created / 1000)}:R>`}`,
                inline: true
            })))

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
});