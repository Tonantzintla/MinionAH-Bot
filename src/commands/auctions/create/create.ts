import { SlashCommandSubcommandBuilder } from "discord.js";
import "./interactionListeners/action-buttons.js";
import "./interactionListeners/base.js";

export default new SlashCommandSubcommandBuilder()
  .setName("create")
  .setDescription("Create a new auction")
  .addStringOption((option) =>
    option
      .setName("minion_type")
      .setDescription("Type of minion to auction")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("minion_tier")
      .setDescription("Tier of minion to auction")
      .setRequired(true)
      .addChoices(
        Array.from({ length: 12 }, (_, i) => i + 1).map((tier) => ({
          name: `Tier ${tier}`,
          value: tier
        }))
      )
  )
  .addIntegerOption((option) =>
    option
      .setName("quantity")
      .setDescription("Quantity of minions to auction")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName("price").setDescription("Price per minion").setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("mithril_infusion")
      .setDescription(
        "Whether the minion has Mithril Infusion (10% speed boost)"
      )
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("free_will")
      .setDescription("Whether the minion has Free Will (10% speed boost)")
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("negotiable")
      .setDescription("Price is negotiable")
      .setRequired(false)
  );
