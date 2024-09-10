import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
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
    .setLabel("Next →")
    .setStyle(ButtonStyle.Primary)
    let row = new ActionRowBuilder().addComponents(nextButton);
    // add previous button if page > 0
    if (page > 0) {
        row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("prices:direction:" + (page - 1))
                    .setLabel("← Previous")
                    .setStyle(ButtonStyle.Secondary),
                nextButton
            );
    }
    return row;
}

function getMinionEmbed(minions: Awaited<ReturnType<typeof getMinionPrices>>, offset: number = 0) {
    try {
        if (!minions) throw new Error("Minions is null.");
        const displayedEntries = Object.entries(minions).slice(offset * 10, offset * 10 + 10);
        const embed = new EmbedBuilder()
            .setTitle("Minion Prices")
            .setDescription("Here are the prices for all minions.")
            .setFooter({
                text: "By MinionAH - Showing page " + (offset + 1),
            })
            .setColor("#00ff00")
            .addFields(displayedEntries.map(([type, price]) => ({
                name: `\`${parseType(type)}\``,
                value: price.toFixed(1) + " coins",
                inline: true,
            })))
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
        let embed: ReturnType<typeof getMinionEmbed>;
        if (type) {
            const filtered = filterMinions(minions, type);
            if (filtered === null) return await interaction.reply({ content: "No minions found from the API!", ephemeral: true });
            if (filtered.length === 0) return await interaction.reply({ content: "No minions found with that type!", ephemeral: true });
            embed = getMinionEmbed(Object.fromEntries(filtered));
        } else {
            embed = getMinionEmbed(minions);
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
        const embed = getMinionEmbed(minions, page);
        if (!embed) return await interaction.reply({ content: "There was an error while creating the embed!", ephemeral: true });
        //@ts-ignore
        return await interaction.update({ embeds: [embed], ephemeral: true, components: [pageButtons(page)] });
    } catch (error) {
        console.error("Error in '/prices <type>' command: ", error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
})
