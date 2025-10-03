import { SlashCommandBuilder } from "discord.js";
import create from "./create.js";
import search from "./search/searchV2.js";
// import _delete from "./delete.js";

export default new SlashCommandBuilder()
  .setName("auctions")
  .setDescription("Actions on auctions")
  .addSubcommand(create)
  // .addSubcommand(_delete)
  .addSubcommand(search);
