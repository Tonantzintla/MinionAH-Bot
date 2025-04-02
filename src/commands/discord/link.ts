import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { client } from "../../discord/client.js";
import getSubcommand from "../../lib/getSubcommand.js";

export default new SlashCommandSubcommandBuilder()
    .setName("link")
    .setDescription("Link your Discord account with your MinionAH account")


client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return
    if (interaction.commandName !== "discord" || getSubcommand(interaction) !== "link") return

    try {
        const embed = new EmbedBuilder()
            .setTitle("✅ Link your Discord account to MinionAH")
            .setColor("#2B2D31")
            .setDescription("To link your Discord account to MinionAH, click the button below")

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Link Discord Account")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://minionah.com/profile/settings")
            )
        
        await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true })
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
    }
})