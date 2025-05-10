import { SlashCommandBuilder } from "discord.js";
import create from "./create.js";
import _delete from "./delete.js";
import search from "./search.js";

export default new SlashCommandBuilder()
  .setName("auctions")
  .setDescription("Actions on auctions")
  .addSubcommand(create)
  // .addSubcommand(_delete)
  .addSubcommand(search);
