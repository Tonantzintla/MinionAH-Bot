import { ActionRowBuilder, ApplicationEmoji, ButtonBuilder, ButtonStyle, ClientApplication, Collection, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { client } from "../../discord/client.js";
import getMinionPrices from "../../lib/prices/getMinionPrices.js";
import { romanise } from "../../lib/prices/romanise.js";

// init slash commands
export default new SlashCommandBuilder()
    .setName("prices")
    .setDescription("Get the price for a minion. Or all of them!")
    .addStringOption(option => option
        .setName("type")
        .setDescription("The type of minion you want to check the price for.")
        .setRequired(false)
    )

const minionsPerPage = 10;

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// strings joined with _ and then "GENERATOR_{level}". example "ACACIA_GENERATOR_1". transform to "Acacia I"
function parseType(type: string) {
    try {
        const parts = type.split("_");
        if (parts.length < 3) throw new Error("Invalid type on /prices's parseType. Received: " + type);
        const level = parseInt(parts.pop()!);
        const name = parts.slice(0, parts.length - 1).map(capitalize).join(" ");
        return name + " " + romanise(level);
    } catch (error) {
        console.error("Error in parseType: ", error);
        return type
    }
}

function pageButtons(page: number) {
    const nextButton = new ButtonBuilder()
        .setCustomId("prices:direction:" + (page + 1))
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
    const isGoBack1Disabled = page === 0;
    const isGoBack2Disabled = page <= 1;
    let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("prices:direction:" + (page - 2))
            .setLabel("⏪")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isGoBack2Disabled),
        new ButtonBuilder()
            .setCustomId("prices:direction:" + (page - 1))
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isGoBack1Disabled),
        new ButtonBuilder()
        .setURL("https://minionah.com/pricecheck")
        .setLabel("🌐")
        .setStyle(ButtonStyle.Link),
        nextButton,
        new ButtonBuilder()
            .setCustomId("prices:direction:" + (page + 2))
            .setLabel("⏩")
            .setStyle(ButtonStyle.Primary)
    );
    // add previous button if page > 0
    return row;
}

function resolveEmoji(minion: string, botEmojis: Collection<string, ApplicationEmoji>) {
    const emoji = botEmojis.find(emoji => emoji.name === minion);
    if (!emoji) return "<:ZOMBIE_GENERATOR_1:1284520647984152731>"
    return `<:${minion}:${emoji?.id}>`;
}

function formatPrice(num: number): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2).replace(/\.0$/, '') + 'B';
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(0).replace(/\.0$/, '') + 'K';
    } else {
        return num.toFixed(0);
    }
}

async function getMinionEmbed(minions: Awaited<ReturnType<typeof getMinionPrices>>, offset: number = 0) {
    try {
        if (!minions) throw new Error("Minions is null.");
        const botEmojis = await client.application?.emojis.fetch();
        if (!botEmojis) throw new Error("Bot emojis not found.");

        const displayedEntries = Object.entries(minions).slice(offset * minionsPerPage, offset * minionsPerPage + minionsPerPage);
        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("Minion Prices")
            .setDescription("See the craft cost of each minion and tier so you can make the best decision when buying or selling minions.")
            .setFooter({
                text: "By MinionAH - Showing page " + (offset + 1),
            })
            .addFields([{
                name: " ",
                value: displayedEntries.map(([type, price]) => `${resolveEmoji(type, botEmojis)} ${parseType(type)} ~ \`${formatPrice(price)}\``).join("\n"),
                inline: true
            }])
        if (displayedEntries.length === 0) {
            embed.setDescription("There are no more minions to show.");
        }
        return embed;
    } catch (error) {
        console.error("Error in getMinionEmbed: ", error);
        return null;
    }
}

function filterMinions(minions: Awaited<ReturnType<typeof getMinionPrices>>, type: string) {
    if (!minions) return null
    return Object.entries(minions).filter(([key]) => key.startsWith(type));
}


// bot listeners
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    try {
        const type = interaction.options.get("type")?.value as string | undefined;
        // minions
        const minions = await getMinionPrices()
        if (!minions) return await interaction.reply({ content: "There was an error while fetching the prices!", ephemeral: true });
        //embed
        let embed: Awaited<ReturnType<typeof getMinionEmbed>>;
        if (type) {
            const filtered = filterMinions(minions, type);
            if (filtered === null) return await interaction.reply({ content: "No minions found from the API!", ephemeral: true });
            if (filtered.length === 0) return await interaction.reply({ content: "No minions found with that type!", ephemeral: true });
            embed = await getMinionEmbed(Object.fromEntries(filtered));
        } else {
            embed = await getMinionEmbed(minions);
        }
        if (!embed) return await interaction.reply({ content: "There was an error while creating the embed!", ephemeral: true });

        //@ts-ignore - "components" is cooked
        return await interaction.reply({ embeds: [embed], ephemeral: true, components: !type ? [pageButtons(0)] : undefined });
    } catch (error) {
        console.error("Error in '/prices <type>' command: ", error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
})

client.on("interactionCreate", async (interaction) => {
    // button check
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("prices:direction:")) return;
    try {
        const page = parseInt(interaction.customId.split(":")[2]);
        // minions
        const minions = await getMinionPrices();
        if (!minions) return await interaction.reply({ content: "There was an error while fetching the prices!", ephemeral: true });
        // embed
        const embed = await getMinionEmbed(minions, page);
        if (!embed) return await interaction.reply({ content: "There was an error while creating the embed!", ephemeral: true });
        //@ts-ignore
        return await interaction.update({ embeds: [embed], ephemeral: true, components: [pageButtons(page)] });
    } catch (error) {
        console.error("Error in '/prices <type>' command: ", error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
})
