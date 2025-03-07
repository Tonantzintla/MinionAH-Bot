import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, InteractionResponse, SlashCommandSubcommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Auction } from "../../lib/types/auction.js";
import { client } from "../../discord/client.js";
import getSubcommand from "../../lib/getSubcommand.js";
import formatMinionPrice from "../../lib/prices/formatMinionPrice.js";
import resolveMinionEmoji from "../../lib/resolveMinionEmoji.js";
import parseMinionType from "../../lib/auctions/parseMinionType.js";
import auctions from "./auctions.js";
import { kv } from "../../central.config.js";

interface DisplayableAuctions {
    minionType: string; // parsed: plaintext-displayable
    price: number;
    amount: number;
    created: number; // timestamp
    lastBumped: number | null; // timestamp
    // stuff used on the backend
    system: {
        tier: number;
        fullType: string;
    }
}

interface PersistentSearchData {
    page: number;
    minionType?: string;
    minionTier?: number;
    sorting?: "asc" | "desc";
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

// TODO: remove this - just for mockup
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
        const lastBumped = Date.now() - Math.floor(Math.random() * 1000000000); // Random timestamp within the last ~11.5 days

        auctions.push({
            minionType,
            price,
            amount,
            lastBumped,
            created,
            system: {
                tier,
                fullType: "ACACIA_GENERATOR_1"
            }
        });
    }

    return auctions;
}

// TODO: change this to a real implementation
function displayableMutation(auctions: Auction.FetchedAuctionData[]): DisplayableAuctions[] {
    return generateAuctionData(commandParams.auctionsPerPage * 5)
}

/**
 * Retrieves auctions from the API, applies filters, mutates to displayable format and returns the result
 * @param page page number
 * @param filters filter by minion type and tier 
 * @returns auctions and the sum of minions found
 */
async function getAuctions(page: number, {
    minionType,
    minionTier
}: {
    minionType?: string, minionTier?: number
}): Promise<{
    auctions: DisplayableAuctions[]
    minionSum: number
    totalAuctions: number
}> {
    // get auctions from API
    const auctions: Auction.FetchedAuctionData[] = []
    let mutated = displayableMutation(auctions)

    // apply filters
    if (minionType) {
        mutated = mutated.filter(auction => auction.system.fullType.toLowerCase().includes(minionType.toLowerCase()))
    }

    if (minionTier) {
        mutated = mutated.filter(auction => auction.system.tier === minionTier)
    }
    return {
        auctions: mutated.slice(page * commandParams.auctionsPerPage, (page + 1) * commandParams.auctionsPerPage),
        minionSum: 0,
        totalAuctions: mutated.length
    }
}

async function makeEmbed(page: number, { minionType, minionTier, sorting }: { minionType?: string, minionTier?: number, sorting?: "asc" | "desc" }): Promise<{
    embed: EmbedBuilder,
    auctions: DisplayableAuctions[],
    totalAuctions: number
} | null> {
    try {
        // fetch bot emojis for decoding
        const botEmojis = await client.application?.emojis.fetch()
        if (!botEmojis) return null

        // fetch auctions
        const { auctions, minionSum, totalAuctions } = await getAuctions(page, { minionType, minionTier });

        switch (sorting) {
            case "asc":
                auctions.sort((a, b) => a.price - b.price)
                break;
            case "desc":
                auctions.sort((a, b) => b.price - a.price)
                break;
        }

        // for clarity, define the fields for the description
        const descriptionFields = [
            `**Auctions:** ${auctions.length}`,
            `**Minions Found:** ${minionSum}`
        ]

        // mini-function to define the fields for each auction
        const auctionFields = (action: typeof auctions[number]) => [
            `Price: **${formatMinionPrice(action.price)}**`,
            `Amount: **${action.amount}**`,
            `Created: ${`<t:${Math.floor(action.created / 1000)}:R>`}`,
            action.lastBumped ? `Last Bumped: ${`<t:${Math.floor(action.lastBumped / 1000)}:R>`}` : null
        ].filter(Boolean)

        // construct the embed
        const embed = new EmbedBuilder()
            .setTitle("Auction Search")
            .setDescription("Here are the search results for the auctions you requested")
            .setColor("#2B2D31")
            .setDescription(descriptionFields.join("\n"))
            .addFields(auctions.map((auction, idx) => ({
                name: `${resolveMinionEmoji(auction.system.fullType, botEmojis)} ${parseMinionType(auction.system.fullType)}`,
                value: auctionFields(auction).join("\n"),
                inline: true
            })))
            .setFooter({
                text: `By MinionAH. Showing page ${page + 1} of ${Math.ceil(totalAuctions / commandParams.auctionsPerPage)}`
            })
        return { embed, auctions, totalAuctions }
    } catch (error) {
        console.error(error);
        return null;
    }
}

function makePagination(currentPage: number, totalAuctions: number) {
    const numPages = Math.ceil(totalAuctions / commandParams.auctionsPerPage);
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel("⬅️ Previous Page")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0)
                .setCustomId(`auctions:search:page:previous`),
            new ButtonBuilder()
                .setLabel("🔢 Go to Page")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`auctions:search:page:go-to`),
            new ButtonBuilder()
                .setLabel("Next Page ➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === numPages - 1)
                .setCustomId(`auctions:search:page:next`)
        )

}

function makeStringSelect(currentSorting?: "asc" | "desc") {
    const options = [
        new StringSelectMenuOptionBuilder()
            .setLabel("Ascending")
            .setValue("asc")
            .setDefault(currentSorting === "asc")
            .setDescription("Sort the auctions in ascending order")
            .setEmoji("⬆️"),
        new StringSelectMenuOptionBuilder()
            .setLabel("Descending")
            .setValue("desc")
            .setDefault(currentSorting === "desc")
            .setDescription("Sort the auctions in descending order")
            .setEmoji("⬇️"),
    ]
    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("auctions:search:sort")
                .setPlaceholder("Select the sorting order")
                .addOptions(options)
                .setMaxValues(1)
                .setMinValues(1)
        )
}

function applyCollectorToStringSelect(reply: InteractionResponse<boolean>) {
    try {
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (interaction) => interaction.customId === "auctions:search:sort"
        })

        collector.on("collect", async interaction => {
            const sorting = interaction.values[0] as "asc" | "desc"
            const data = kv.get<PersistentSearchData>(`auctions:search:${interaction.user.id}`)
            const page = data?.page ?? 0
            const embedInstance = await makeEmbed(page, {
                minionType: data?.minionType,
                minionTier: data?.minionTier,
                sorting
            });

            if (!embedInstance) {
                await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
                return
            }

            const { embed, totalAuctions } = embedInstance

            const pagination = makePagination(page, totalAuctions)

            kv.set<PersistentSearchData>(`auctions:search:${interaction.user.id}`, { page, minionType: data?.minionType, minionTier: data?.minionTier, sorting })

            await interaction.update({ embeds: [embed], components: [pagination, makeStringSelect(sorting)], });
        })
    } catch (error) {
        console.error(error)
    }
}

/**
 * Event handler for the auctions search command (base)
 */
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== "auctions" || getSubcommand(interaction) !== "search") return;

    try {
        // get filters
        const minionType = interaction.options.get("minion_type", false)?.value as string | undefined;
        const minionTier = interaction.options.get("minion_tier", false)?.value as number | undefined;

        // make the embed
        const embedInstance = await makeEmbed(0, {
            minionType,
            minionTier
        });

        if (!embedInstance) {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            return
        }

        const { embed, totalAuctions } = embedInstance

        const pagination = makePagination(0, totalAuctions)
        kv.set<PersistentSearchData>(`auctions:search:${interaction.user.id}`, { page: 0, minionType, minionTier })
        const reply = await interaction.reply({ embeds: [embed], components: [pagination, makeStringSelect()], ephemeral: true });
        applyCollectorToStringSelect(reply)
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
});

/**
 * Event handler for pagination buttons
 */
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("auctions:search:page")) return;
    try {
        const action = interaction.customId.split(":")[3] as "previous" | "next" | "go-to";
        const user = interaction.user.id;
        const data = kv.get<PersistentSearchData>(`auctions:search:${user}`);
        let page = data?.page ?? 0;
        switch (action) {
            case "previous":
                page--;
                break;
            case "next":
                page++;
                break;
            case "go-to":
                await interaction.showModal({
                    title: "Jump to Page",
                    customId: "auctions:search:page:jump",
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                new TextInputBuilder()
                                    .setCustomId("auctions:search:page:jump-input")
                                    .setLabel("Page Number")
                                    .setStyle(TextInputStyle.Short)
                                    .setPlaceholder("Type the page number")
                                    .setRequired(true)
                            ]
                        }
                    ]
                })
                return;
        }
        console.log(page)
        const embedInstance = await makeEmbed(page, {
            minionType: data?.minionType,
            minionTier: data?.minionTier,
            sorting: data?.sorting
        });

        if (!embedInstance) {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            return
        }

        const { embed, totalAuctions } = embedInstance

        const pagination = makePagination(page, totalAuctions)

        kv.set<PersistentSearchData>(`auctions:search:${user}`, {
            page,
            minionType: data?.minionType,
            minionTier: data?.minionTier,
            sorting: data?.sorting
        })
        const reply = await interaction.update({ embeds: [embed], components: [pagination, makeStringSelect(data?.sorting)] });
        applyCollectorToStringSelect(reply)
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
})

/**
 * Event handler for the jump to page modal
 */
client.on("interactionCreate", async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith("auctions:search:page:jump")) return;
    try {
        // get the page number
        const page = parseInt(interaction.fields.getTextInputValue("auctions:search:page:jump-input")) - 1;
        if (isNaN(page)) {
            await interaction.reply({ content: "Invalid page number!", ephemeral: true });
            return
        }
        // get the user
        const user = interaction.user.id
        const data = kv.get<PersistentSearchData>(`auctions:search:${user}`)

        const embedInstance = await makeEmbed(page, {
            minionType: data?.minionType,
            minionTier: data?.minionTier
        });

        if (!embedInstance) {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            return
        }

        const { embed, totalAuctions } = embedInstance

        const pagination = makePagination(page, totalAuctions)

        kv.set<PersistentSearchData>(`auctions:search:${user}`, {
            page,
            minionType: data?.minionType,
            minionTier: data?.minionTier,
            sorting: data?.sorting
        })

        const reply = await interaction.reply({ embeds: [embed], components: [pagination, makeStringSelect()], ephemeral: true });
        applyCollectorToStringSelect(reply)
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
})