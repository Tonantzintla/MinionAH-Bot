import assert from "assert";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { kv } from "../../central.config.js";
import { client } from "../../discord/client.js";
import getMinionTypes from "../../lib/auctions/getMinionTypes.js";
import getSubcommand from "../../lib/getSubcommand.js";
import resolveMinionEmoji from "../../lib/resolveMinionEmoji.js";
import { Auction } from "../../lib/types/auction.js";

interface AuctionCreationBody {
    discordID: string;
    auction: {
        type: string;
        tier: number;
        amount: number;
        price: number;
        mithrilInfused: boolean;
        freeWill: boolean;
    }
}

export default new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create a new auction")
    .addStringOption(option =>
        option.setName("minion_type")
            .setDescription("The type of the minion to create an auction for")
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addIntegerOption(option =>
        option.setName("minions_amount")
            .setDescription("The amount of minions to auction (max 512)")
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("minion_tier")
            .setDescription("The tier of the minions to auction")
            .setRequired(true)
            .addChoices([
                ...Array.from({ length: 12 }).map((_, tier) => ({
                    name: `Tier ${tier + 1}`,
                    value: tier + 1
                }))
            ])
    )
    .addIntegerOption(option =>
        option.setName("starting_price")
            .setDescription("The starting price of the auction")
            .setRequired(true)
    )
    .addBooleanOption(option =>
        option.setName("mithril_infusion")
            .setDescription("Do your minions have mithril infusion?")
            .setRequired(false)
    )
    .addBooleanOption(option =>
        option.setName("free_will")
            .setDescription("Do your minions have free will?")
            .setRequired(false)
    )

async function validateSelectedMinionType(type: string, tier: number) {
    try {
        const minionIDs = await getMinionTypes(true); // returns raw minion types
        if (!minionIDs) throw new Error("No minion types found");
        const validMinionIDs = minionIDs.filter(ID => ID.includes(type.toUpperCase()) && ID.split("_").slice(-1)[0] === tier.toString())
        return {
            systemError: false,
            valid: validMinionIDs.length === 1,
            validMinionID: validMinionIDs[0]
        }
    } catch (error) {
        console.error(error);
        return {
            valid: false,
            systemError: true
        }
    }
}

// base listener
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== "auctions" || getSubcommand(interaction) !== "create") return;
    try {
        const systemEmojis = await client.application?.emojis.fetch()
        if (!systemEmojis) throw new Error("An error occurred while fetching the bot emojis. Please try again later.");
        const opts: Auction.AuctionOptions = {
            type: interaction.options.get("minion_type", true).value as string,
            amount: interaction.options.get("minions_amount", true).value as number,
            price: interaction.options.get("starting_price", true).value as number,
            mithrilInfused: interaction.options.get("mithril_infusion", false)?.value as boolean ?? false,
            tier: interaction.options.get("minion_tier", true).value as number,
            freeWill: interaction.options.get("free_will", false)?.value as boolean ?? false
        }

        const minionTypeValidation = await validateSelectedMinionType(opts.type, opts.tier);
        if (minionTypeValidation.systemError) throw new Error("An error occurred while validating the minion type. Please try again later.");

        const validations = {
            minionType: {
                check: minionTypeValidation.valid,
                errorMessage: "Invalid minion type or tier. Please use the autocomplete to select a valid minion type and tier."
            },
            minionsAmount: {
                check: opts.amount > 0 && opts.amount <= 512,
                errorMessage: "Minions amount must be between 1 and 512."
            },
            startingPrice: {
                check: opts.price > 0,
                errorMessage: "Starting price must be greater than 0."
            },
            mithrilInfusion: {
                check: true, // no validation needed, its a boolean!
                errorMessage: "How did you even get here?"
            },
            minionTier: {
                check: opts.tier >= 1 && opts.tier <= 12,
                errorMessage: "Minion tier must be between 1 and 12."
            },
            freeWill: {
                check: true, // no validation needed, its a boolean!
                errorMessage: "How did you even get here?"
            }
        };

        // assertions
        for (const [key, value] of Object.entries(validations)) {
            assert(value.check, value.errorMessage);
        }

        const minionTypeCapitalized = [opts.type.split("_")[0]].map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");

        // organize props
        const props = [
            "⚙️ Minion Type ~ " + resolveMinionEmoji(minionTypeValidation.validMinionID!, systemEmojis) + " " + minionTypeCapitalized + ` ${opts.tier}`,
            "🔢 Minions Amount ~ " + opts.amount,
            "💵 Starting Price ~ " + opts.price + " Coins",
            "⚡ Mithril Infusion ~ " + (opts.mithrilInfused ? "✅" : "⛔"),
            "💪 Free Will ~ " + (opts.freeWill ? "✅" : "⛔")
        ]

        // create embed
        const embed = new EmbedBuilder()
            .setTitle("🟠 Auction Summary")
            .setDescription(`You are about to create an auction. Please review the details below and confirm your action.
                \n**Note:** This embed will be active for only the next hour`)
            .addFields([
                {
                    name: "⁠",
                    value: props.join("\n\n"),
                }
            ])

        const tempAuctionID = `auction:create:${interaction.user.id}:${interaction.id}`; // usage in cache - reconstructable
        // action buttons
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("auctions_create%confirm%" + tempAuctionID)
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("✅"),
                new ButtonBuilder()
                    .setCustomId("auctions_create%cancel%" + tempAuctionID)
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("⛔")
            )

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: [row]
        })

        kv.set(tempAuctionID, opts);
    } catch (error) {
        console.error(error);
        const e = error as Error;
        await interaction.reply({ content: e.message, ephemeral: true });
    }
})

// autocomplete listener for minion_type
client.on("interactionCreate", async interaction => {
    try {
        // check for autocomplete interaction and correct command
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "auctions" || getSubcommand(interaction) !== "create") return;
        // get focused option
        const focused = interaction.options.getFocused(true);
        if (!focused || focused.name !== "minion_type") return;
        // fetch minion types
        const minionTypes = await getMinionTypes();
        if (!minionTypes) {
            await interaction.respond([])
            return
        }
        // get filter
        const val = interaction.options.getString("minion_type") as string; // is required
        // len == 0 -> return first five
        if (val.length === 0) return await interaction.respond(
            minionTypes.slice(0, 5).map(minionType => ({
                name: minionType,
                value: minionType.toLowerCase()
            }))
        )
        // filter
        const filtered = minionTypes.filter(minionType => minionType.toLowerCase().includes(val.toLowerCase()));
        await interaction.respond(
            filtered.slice(0, 5).map(minionType => ({
                name: minionType,
                value: minionType.toLowerCase()
            }))
        )
    } catch (error) {
        console.error(error);
    }
})

// button listener
client.on("interactionCreate", async interaction => {
    try {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("auctions_create%")) return;
        const [_, action, tempAuctionID] = interaction.customId.split("%");
        const opts = kv.get<Auction.AuctionOptions>(tempAuctionID);
        if (!opts) return await interaction.reply({ content: "The auction you are interacting with has expired.", ephemeral: true });
        switch (action) {
            case "confirm":
                const auctionBodyMapped: AuctionCreationBody = {
                    discordID: interaction.user.id,
                    auction: {
                        type: opts.type,
                        tier: opts.tier,
                        amount: opts.amount,
                        price: opts.price,
                        mithrilInfused: opts.mithrilInfused,
                        freeWill: opts.freeWill
                    }
                }
                console.log(auctionBodyMapped);
                await interaction.reply({ content: "Auction confirmed!", ephemeral: true });
                // todo: send to API
                break;
            case "cancel":
                await interaction.reply({ content: "Auction cancelled!", ephemeral: true });
                break;
        }
        kv.del(tempAuctionID);
    } catch (error) {
        console.error(error);
    }
})


