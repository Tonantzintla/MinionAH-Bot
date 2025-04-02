import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, InteractionResponse, SlashCommandSubcommandBuilder } from "discord.js";
import { client } from "../../discord/client.js";
import getSubcommand from "../../lib/getSubcommand.js";
import { kv, prisma } from "../../central.config.js";

export default new SlashCommandSubcommandBuilder()
    .setName("unlink")
    .setDescription("Unlink your Discord account from your MinionAH account")

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return
    if (interaction.commandName !== "discord" || getSubcommand(interaction) !== "unlink") return

    try {
        const warningEmbed = new EmbedBuilder()
            .setTitle("⚠️ Unlink your Discord account from MinionAH")
            .setColor("#2B2D31")
            .setDescription("Are you sure you want to unlink your Discord account from MinionAH? You can link it back at any time by using the `/discord link` command")

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Unlink Discord Account")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("discord-integration:unlink:" + interaction.user.id),
                new ButtonBuilder()
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("discord-integration:unlink-cancel:" + interaction.user.id)
            )

        const reply = await interaction.reply({ embeds: [warningEmbed], components: [actionRow], ephemeral: true })
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
    }
})

client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return
    if (!interaction.customId.startsWith("discord-integration:unlink")) return

    try {
        if (interaction.customId.startsWith("discord-integration:unlink-cancel")) {
            const responseEmbed = new EmbedBuilder()
                .setTitle("🚫 Unlinking Process Cancelled")
                .setColor("#2B2D31")
                .setDescription("The unlinking process has been cancelled")
            
            await interaction.reply({ embeds: [responseEmbed], components: [], ephemeral: true })
            return
        }
        
        await prisma.userOAuthProvider.delete({
            where: {
                id: interaction.user.id,
                provider: "discord"
            }
        })

        const responseEmbed = new EmbedBuilder()
            .setTitle("✅ Unlinking Process Completed ")
            .setColor("#2B2D31")
            .setDescription("Your Discord account has been unlinked from MinionAH. You can link it back at any time by using the `/discord link` command")
        await interaction.reply({ embeds: [responseEmbed], components: [], ephemeral: true })
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
    }
})