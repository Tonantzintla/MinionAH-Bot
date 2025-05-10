import getMinionTypes from "$lib/auctions/getMinionTypes.js";
import getSubcommand from "$lib/getSubcommand.js";
import { client } from "$src/discord/client.js";

const permitted = ["auctions:create", "auctions:search"];

// autocomplete listener for minion_type
client.on("interactionCreate", async (interaction) => {
  try {
    // check for autocomplete interaction and correct command
    if (!interaction.isAutocomplete()) return;
    // check if command is permitted to access minion type autocomplete
    if (
      !permitted.includes(
        interaction.commandName + ":" + getSubcommand(interaction)
      )
    )
      return;
    // get focused option
    const focused = interaction.options.getFocused(true);
    if (!focused || focused.name !== "minion_type") return;
    // fetch minion types
    const minionTypes = await getMinionTypes();
    if (!minionTypes) {
      await interaction.respond([]);
      return;
    }
    // get filter
    const val = interaction.options.getString("minion_type") as string; // is required
    // len == 0 -> return first five
    if (val.length === 0)
      return await interaction.respond(
        minionTypes.slice(0, 5).map((minionType) => ({
          name: minionType,
          value: minionType.toLowerCase()
        }))
      );
    // filter
    const filtered = minionTypes.filter((minionType) =>
      minionType.toLowerCase().includes(val.toLowerCase())
    );
    await interaction.respond(
      filtered.slice(0, 5).map((minionType) => ({
        name: minionType,
        value: minionType.toLowerCase()
      }))
    );
  } catch (error) {
    console.error(error);
  }
});
