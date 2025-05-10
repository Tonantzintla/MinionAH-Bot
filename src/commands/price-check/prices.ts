import parseMinionType from "$lib/auctions/parseMinionType.js";
import formatMinionPrice from "$lib/prices/formatMinionPrice.js";
import getMinionPrices from "$lib/prices/getMinionPrices.js";
import resolveMinionEmoji from "$lib/resolveMinionEmoji.js";
import { maintenanceMode } from "$src/central.config";
import { client } from "$src/discord/client.js";
import maintenanceModeEmbed from "$src/discord/maintenanceModeEmbed";
import crypto from "crypto";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";

// init slash commands
export default new SlashCommandBuilder()
  .setName("prices")
  .setDescription("Get the price for a minion. Or all of them!")
  .addStringOption((option) => option.setName("type").setDescription("The type of minion you want to check the price for.").setRequired(false))
  .addIntegerOption((option) => option.setName("tier").setDescription("The tier of the minion you want to check the price for.").setRequired(false));

const minionsPerPage = 10;

/**
 * Creates the response embed with the minion prices
 * @param minionPrices the prices of the minions
 * @param offset the offset corresponding to the page
 * @returns the embed with the minions
 */
async function getMinionEmbed(minionPrices: Awaited<ReturnType<typeof getMinionPrices>>, offset: number = 0) {
  try {
    // if no minions, throw error
    if (!minionPrices) throw new Error("Minions is null.");
    const botEmojis = await client.application?.emojis.fetch();
    // if no bot emojis, throw error
    if (!botEmojis) throw new Error("Bot emojis not found.");

    // get the minions to display
    const displayedEntries = Object.entries(minionPrices).slice(offset * minionsPerPage, offset * minionsPerPage + minionsPerPage);
    // generate the embed
    const embed = new EmbedBuilder()
      .setColor("#262626")
      .setTitle("Minion Prices")
      .setDescription("See the craft cost of each minion and tier so you can make the best decision when buying or selling minions.")
      .setFooter({
        text: "By MinionAH - Showing page " + (offset + 1) + " of " + Math.ceil(Object.keys(minionPrices).length / minionsPerPage)
      })
      .addFields([
        {
          name: " ",
          value: displayedEntries.map(([type, price]) => `${resolveMinionEmoji(type, botEmojis)} ${parseMinionType(type)} ~ \`${formatMinionPrice(price.craftCost)}\``).join("\n"),
          inline: true
        }
      ]);
    // if no minions to display, set description
    if (displayedEntries.length === 0) {
      embed.setDescription("There are no more minions to show.");
    }
    return embed;
  } catch (error) {
    console.error("Error in getMinionEmbed: ", error);
    return null;
  }
}

/**
 * Constructs pagination based on the current page number
 * @param pageNumber the page number the user is on
 * @param maxPages the maximum number of pages
 * @param filter the filter the user is using - used on the custom id
 * @returns the constructed pagination
 */
function constructLocalPagination(pageNumber: number, maxPages: number, filter: string = "_none", tier: number = -1) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`price-check:prices:move-to:${pageNumber - 2}:${filter}:${tier}:local:${crypto.randomBytes(6).toString("hex")}`)
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pageNumber - 2 < 0),
    new ButtonBuilder()
      .setCustomId(`price-check:prices:move-to:${pageNumber - 1}:${filter}:${tier}:local:${crypto.randomBytes(6).toString("hex")}`)
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pageNumber - 1 < 0),
    new ButtonBuilder().setLabel("​").setStyle(ButtonStyle.Link).setURL("https://minionah.com/pricecheck"),
    new ButtonBuilder()
      .setCustomId(`price-check:prices:move-to:${pageNumber + 1}:${filter}:${tier}:local:${crypto.randomBytes(6).toString("hex")}`)
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pageNumber + 1 >= maxPages),
    new ButtonBuilder()
      .setCustomId(`price-check:prices:move-to:${pageNumber + 2}:${filter}:${tier}:local:${crypto.randomBytes(6).toString("hex")}`)
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pageNumber + 2 >= maxPages)
  );
  return row;
}

/**
 * Constructs secondary pagination (2nd row) based on the current page number
 * @param pageNumber the page number the user is on
 * @param maxPages the maximum number of pages
 * @param filter the filter the user is using - used on the custom id
 * @returns the constructed pagination
 */

function constructSecondaryPagination(pageNumber: number, maxPages: number, filter: string = "_none", tier: number = -1) {
  function constructSecondaryPaginationButton(lowLimit: number, displacement: number) {
    const displayedPage = Math.max(pageNumber + displacement, lowLimit);
    const directionID = `price-check:prices:move-to:${Math.max(displayedPage - 1, 0)}:${filter}:secondary:${crypto.randomBytes(6).toString("hex")}`;
    const label = pageNumber === lowLimit ? "🔢" : displayedPage + 1;
    return new ButtonBuilder()
      .setCustomId(pageNumber === lowLimit ? `price-check:prices:paginationModal:${filter}:${tier}:secondary:${crypto.randomBytes(6).toString("hex")}` : directionID)
      .setLabel(label.toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(displayedPage >= maxPages);
  }
  const row = new ActionRowBuilder().addComponents(
    constructSecondaryPaginationButton(0, -2),
    constructSecondaryPaginationButton(1, -1),
    new ButtonBuilder()
      .setCustomId(pageNumber < 2 ? `price-check:prices:move-to:2:${filter}:${tier}:secondary:${crypto.randomBytes(6).toString("hex")}` : `price-check:prices:paginationModal:${filter}:secondary:${crypto.randomBytes(6).toString("hex")}`)
      .setLabel(pageNumber < 2 ? "3" : "🔢")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(maxPages <= 3),
    constructSecondaryPaginationButton(3, 1),
    constructSecondaryPaginationButton(4, 2)
  );
  return row;
}

/**
 * base listener for the prices command
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!(interaction.commandName === "prices")) return;
  try {
    if (maintenanceMode) return await interaction.reply({ embeds: [maintenanceModeEmbed], ephemeral: true });
    // get prices
    const filter = (interaction.options.get("type")?.value as string | undefined) ?? "_none";
    const tier = (interaction.options.get("tier")?.value as number | undefined) ?? -1;
    const minionPrices = await getMinionPrices(filter, tier);
    // if no prices, throw error
    if (!minionPrices) throw new Error("Minion prices is null.");
    // get page 0
    const page = await getMinionEmbed(minionPrices);
    // if no page, throw error
    if (!page) throw new Error("Page is null.");
    // send the embed
    // @ts-ignore
    await interaction.reply({
      embeds: [page],
      components: [
        //@ts-ignore
        constructLocalPagination(0, Math.ceil(Object.keys(minionPrices).length / minionsPerPage), filter, tier),
        //@ts-ignore
        constructSecondaryPagination(0, Math.ceil(Object.keys(minionPrices).length / minionsPerPage), filter, tier)
      ],
      ephemeral: true
    });
  } catch (error) {
    console.error("Error in prices command: ", error);
    await interaction.reply({
      content: "An error occurred while fetching the minion prices.",
      ephemeral: true
    });
  }
});

/**
 * Page movement listener for the prices command
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("price-check:prices:move-to")) return;
  try {
    if (maintenanceMode) return await interaction.reply({ embeds: [maintenanceModeEmbed], ephemeral: true });
    // get the page number
    const pageNumber = parseInt(interaction.customId.split(":")[3]);
    // get the filter
    const filter = interaction.customId.split(":")[4];
    // get the tier
    const tier = parseInt(interaction.customId.split(":")[5]);
    // get the page
    const minionPrices = await getMinionPrices(filter, tier);
    // if no prices, throw error
    if (!minionPrices) throw new Error("Minion prices is null.");
    // get the page
    const page = await getMinionEmbed(minionPrices, pageNumber);
    // if no page, throw error
    if (!page) throw new Error("Page is null.");
    // edit the message
    // @ts-ignore
    await interaction.update({
      embeds: [page],
      ephemeral: true,
      components: [
        //@ts-ignore
        constructLocalPagination(pageNumber, Math.ceil(Object.keys(minionPrices).length / minionsPerPage), filter, tier),
        //@ts-ignore
        constructSecondaryPagination(pageNumber, Math.ceil(Object.keys(minionPrices).length / minionsPerPage), filter, tier)
      ]
    });
  } catch (error) {
    console.error("Error in prices command: ", error);
    await interaction.reply({
      content: "An error occurred while fetching the minion prices.",
      ephemeral: true
    });
  }
});

/**
 * Pagination modal listener for the prices command
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("price-check:prices:paginationModal") || !interaction.customId.includes(":secondary")) return;
  try {
    // get the filter
    const filter = interaction.customId.split(":")[3];
    const tier = parseInt(interaction.customId.split(":")[4]);
    // get the prices
    const minionPrices = await getMinionPrices(filter, tier);
    // if no prices, throw error
    if (!minionPrices) throw new Error("Minion prices is null.");
    // open modal
    await interaction.showModal({
      title: "Jump to page",
      customId: `price-check:prices:paginationModal_instance:${filter}:${tier}:${crypto.randomBytes(6).toString("hex")}`,
      components: [
        {
          type: 1,
          components: [
            {
              type: ComponentType.TextInput,
              customId: "price-check:prices:paginationModal_instance:pageInput",
              label: "Page Number",
              style: 1, // Short
              placeholder: "Type the page number you want to jump to",
              required: true
            }
          ]
        }
      ]
    });
    return;
  } catch (error) {
    console.error("Error in prices command: ", error);
    await interaction.reply({
      content: "An error occurred while fetching the minion prices.",
      ephemeral: true
    });
  }
});

/**
 * Pagination modal instance listener for the prices command
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("price-check:prices:paginationModal_instance")) return;
  try {
    // get the page number
    const pageNumber = parseInt(interaction.fields.getTextInputValue("price-check:prices:paginationModal_instance:pageInput"));
    // get the filter
    const filter = interaction.customId.split(":")[3];
    const tier = parseInt(interaction.customId.split(":")[4]);
    // get the prices
    const minionPrices = await getMinionPrices(filter, tier);
    // if no prices, throw error
    if (!minionPrices) throw new Error("Minion prices is null.");
    // if page is invalid, throw error
    if (pageNumber < 1 || pageNumber > Math.ceil(Object.keys(minionPrices).length / minionsPerPage)) {
      await interaction.reply({
        content: "Invalid page number. Please try again.",
        ephemeral: true
      });
      return;
    }
    // get the page
    const page = await getMinionEmbed(minionPrices, pageNumber - 1);
    // if no page, throw error
    if (!page) throw new Error("Page is null.");
    // edit the message
    // @ts-ignore
    await interaction.reply({
      embeds: [page],
      ephemeral: true,
      components: [
        //@ts-ignore
        constructLocalPagination(pageNumber - 1, Math.ceil(Object.keys(minionPrices).length / minionsPerPage), filter, tier),
        //@ts-ignore
        constructSecondaryPagination(pageNumber - 1, Math.ceil(Object.keys(minionPrices).length / minionsPerPage), filter, tier)
      ]
    });
  } catch (error) {
    console.error("Error in prices command: ", error);
    await interaction.reply({
      content: "An error occurred while fetching the minion prices.",
      ephemeral: true
    });
  }
});
