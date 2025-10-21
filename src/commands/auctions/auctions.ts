import { SlashCommandBuilder } from "discord.js";
import create from "./create/create.js";
import _delete from "./delete/delete.js";
import search from "./search/search.js";

export default new SlashCommandBuilder()
  .setName("auctions")
  .setDescription("Actions on auctions")
  .addSubcommand(create)
  .addSubcommand(_delete)
  .addSubcommand(search);
