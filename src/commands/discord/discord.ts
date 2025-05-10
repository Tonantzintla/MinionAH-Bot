import { SlashCommandBuilder } from "discord.js";
import link from "./link.js";
import unlink from "./unlink.js";

export default new SlashCommandBuilder()
  .setName("discord")
  .setDescription(
    "Commands related to the integration of Discord with MinionAH"
  )
  .addSubcommand(link)
  .addSubcommand(unlink);
