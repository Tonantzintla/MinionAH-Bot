import getSubcommand from "$lib/getSubcommand.js";
import validatePlaintextMinionType from "$lib/minions/validatePlaintextMinionType.js";
import resolveMinionEmoji from "$lib/resolveMinionEmoji.js";
import { Auction } from "$lib/types/auction.js";
import { kv, maintenanceMode, prisma } from "$src/central.config.js";
import { client } from "$src/discord/client.js";
import maintenanceModeEmbed from "$src/discord/maintenanceModeEmbed";
import assert from "assert";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandSubcommandBuilder
} from "discord.js";

interface AuctionCreationBody {
  discordID: string;
  auction: {
    type: string;
    tier: number;
    amount: number;
    price: number;
    mithrilInfused: boolean;
    freeWill: boolean;
    negotiable: boolean;
  };
}

export default new SlashCommandSubcommandBuilder()
  .setName("create")
  .setDescription("Create a new auction")
  .addStringOption((option) =>
    option
      .setName("minion_type")
      .setDescription("The type of the minion to create an auction for")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("minions_amount")
      .setDescription("The amount of minions to auction (max 512)")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("minion_tier")
      .setDescription("The tier of the minions to auction")
      .setRequired(true)
      .addChoices([
        ...Array.from({ length: 12 }).map((_, tier) => ({
          name: `Tier ${tier + 1}`,
          value: tier + 1
        }))
      ])
  )
  .addIntegerOption((option) =>
    option
      .setName("starting_price")
      .setDescription("The starting price of the auction")
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("mithril_infusion")
      .setDescription("Do your minions have mithril infusion?")
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("free_will")
      .setDescription("Do your minions have free will?")
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("negotiable")
      .setDescription("Do you want to make your price negotiable?")
      .setRequired(false)
  );

// base listener
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (
    interaction.commandName !== "auctions" ||
    getSubcommand(interaction) !== "create"
  )
    return;
  try {
    if (maintenanceMode)
      return await interaction.reply({
        embeds: [maintenanceModeEmbed],
        ephemeral: true
      });
    const isLinked = await prisma.userOAuthProvider.findFirst({
      where: {
        id: interaction.user.id,
        provider: "discord"
      }
    });
    if (!isLinked) {
      const embed = new EmbedBuilder()
        .setColor("#262626")
        .setTitle("⚠️ A link to your MinionAH account is required")
        .setDescription(
          "You need to link your Discord account to your MinionAH account in order to create an auction. Please click the button below to link your account."
        )
        .setFooter({
          text: "If you don't have a MinionAH account, please create one at minionah.com"
        });
      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("Link your Discord account")
              .setStyle(ButtonStyle.Link)
              .setURL("https://minionah.com/profile/settings")
          )
        ]
      });
    }
    const systemEmojis = await client.application?.emojis.fetch();
    if (!systemEmojis)
      throw new Error(
        "An error occurred while fetching the bot emojis. Please try again later."
      );
    // organize options
    const opts: Auction.AuctionOptions = {
      type: interaction.options.get("minion_type", true).value as string,
      amount: interaction.options.get("minions_amount", true).value as number,
      price: interaction.options.get("starting_price", true).value as number,
      mithrilInfused:
        (interaction.options.get("mithril_infusion", false)
          ?.value as boolean) ?? false,
      tier: interaction.options.get("minion_tier", true).value as number,
      freeWill:
        (interaction.options.get("free_will", false)?.value as boolean) ??
        false,
      negotiable:
        (interaction.options.get("negotiable", false)?.value as boolean) ??
        false
    };

    const minionTypeValidation = await validatePlaintextMinionType(
      opts.type,
      opts.tier
    );
    if (minionTypeValidation.systemError)
      throw new Error(
        "An error occurred while validating the minion type. Please try again later."
      );

    // structured validation for options. assists in cleaner assertions
    const validations = {
      minionType: {
        check: minionTypeValidation.valid,
        errorMessage:
          "Invalid minion type or tier. Please use the autocomplete to select a valid minion type and tier."
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
      },
      negotiable: {
        check: true, // no validation needed, its a boolean!
        errorMessage: "How did you even get here?"
      }
    };

    // assertions
    for (const [key, value] of Object.entries(validations)) {
      assert(value.check, value.errorMessage);
    }

    const minionTypeCapitalized = [opts.type.split("_")[0]]
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

    // organize props
    const props = [
      "⚙️ Minion Type ~ " +
        resolveMinionEmoji(minionTypeValidation.validMinionID!, systemEmojis) +
        " " +
        minionTypeCapitalized +
        ` ${opts.tier}`,
      "🔢 Minions Amount ~ " + opts.amount,
      "💵 Starting Price ~ " + opts.price + " Coins",
      "⚡ Mithril Infusion ~ " + (opts.mithrilInfused ? "✅" : "⛔"),
      "💪 Free Will ~ " + (opts.freeWill ? "✅" : "⛔"),
      "🤝 Negotiable ~ " + (opts.negotiable ? "✅" : "⛔")
    ];

    // create embed
    const embed = new EmbedBuilder()
      .setColor("#262626")
      .setTitle("🟠 Auction Summary")
      .setDescription(
        `You are about to create an auction. Please review the details below and confirm your action.
                \n**Note:** This embed will be active for only the next hour`
      )
      .addFields([
        {
          name: "⁠",
          value: props.join("\n\n")
        }
      ]);

    const tempAuctionID = `auction:create:${interaction.user.id}:${interaction.id}`; // usage in cache - reconstructable
    // action buttons
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
    );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
      components: [row]
    });

    kv.set(tempAuctionID, opts);
  } catch (error) {
    console.error(error);
    const e = error as Error;
    await interaction.reply({ content: e.message, ephemeral: true });
  }
});

// button listener
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("auctions_create%")) return;
    if (maintenanceMode)
      return await interaction.reply({
        embeds: [maintenanceModeEmbed],
        ephemeral: true
      });
    const [_, action, tempAuctionID] = interaction.customId.split("%");
    const opts = kv.get<Auction.AuctionOptions>(tempAuctionID);
    if (!opts)
      return await interaction.reply({
        content: "The auction you are interacting with has expired.",
        ephemeral: true
      });
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
            freeWill: opts.freeWill,
            negotiable: opts.negotiable
          }
        };
        const fulltype = await validatePlaintextMinionType(
          auctionBodyMapped.auction.type,
          auctionBodyMapped.auction.tier
        );
        if (fulltype.systemError)
          return interaction.reply(
            "An error occurred while validating the minion type. Please try again later."
          );
        if (!fulltype.valid)
          return interaction.reply(
            "Invalid minion type or tier. Please use the autocomplete to select a valid minion type and tier."
          );
        const minionType = fulltype.validMinionID!;
        const mah_user = await prisma.userOAuthProvider.findFirst({
          where: {
            id: interaction.user.id,
            provider: "discord"
          },
          include: {
            user: true
          }
        });
        console.log(auctionBodyMapped);
        if (!mah_user)
          return await interaction.reply({
            content:
              "You need to link your Discord account to your MinionAH account first. Use `/discord link` to do so.",
            flags: MessageFlags.Ephemeral
          });
        await prisma.auction.create({
          data: {
            amount: auctionBodyMapped.auction.amount,
            price: auctionBodyMapped.auction.price,
            hasFreeWill: auctionBodyMapped.auction.freeWill,
            hasInfusion: auctionBodyMapped.auction.mithrilInfused,
            isNegotiable: auctionBodyMapped.auction.negotiable,
            minion_id: minionType,
            user_id: mah_user.user.id
          }
        });
        await interaction.reply({
          content: "Auction confirmed!",
          ephemeral: true
        });
        break;
      case "cancel":
        await interaction.reply({
          content: "Auction cancelled!",
          ephemeral: true
        });
        break;
    }
    kv.del(tempAuctionID);
  } catch (error) {
    console.error(error);
  }
});
