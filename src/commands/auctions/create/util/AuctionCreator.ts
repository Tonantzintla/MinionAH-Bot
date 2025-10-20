import formatMinionPrice from "$lib/prices/formatMinionPrice";
import resolveMinionEmoji from "$lib/resolveMinionEmoji";
import { prisma } from "$src/central.config";
import { client } from "$src/discord/client";
import getLinkedMinionAHUser from "$src/shared/user/getLinkedMinionAHUser";
import { ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ContainerBuilder, MessageContextMenuCommandInteraction, SeparatorSpacingSize, UserContextMenuCommandInteraction } from "discord.js";
import z from "zod";

type AuctionCreateInteraction = ChatInputCommandInteraction<CacheType>
    | MessageContextMenuCommandInteraction<CacheType>
    | UserContextMenuCommandInteraction<CacheType>

const auctionCreateSchema = z.object({
    minion_type: z.string(),
    minion_tier: z.number().min(1).max(12),
    quantity: z.number().min(1),
    price: z.number().min(0),
    mithril_infusion: z.boolean().optional(),
    free_will: z.boolean().optional(),
    negotiable: z.boolean().optional()
})

const auctionCreatorSettings = {
    options: ["minion_type", "minion_tier", "quantity", "price", "mithril_infusion", "free_will", "negotiable"]
}

export default class AuctionCreator {
    private static auctionCreators: Map<string, AuctionCreator> = new Map();

    private auctionOptions: z.infer<typeof auctionCreateSchema>;

    public constructor(private interaction: AuctionCreateInteraction) {
        const optionData = auctionCreatorSettings.options.map(optionName => this.interaction.options.get(optionName)).filter(opt => opt !== null);
        const auctionOptions = Object.fromEntries(optionData.map(opt => [opt!.name, opt!.value]));

        this.auctionOptions = auctionCreateSchema.parse(auctionOptions);

        AuctionCreator.auctionCreators.set(this.interaction.user.username, this);
    }

    public static cancelCreation(username: string) {
        AuctionCreator.auctionCreators.delete(username);
    }

    public static async confirmCreation(username: string) {
        const creator = AuctionCreator.auctionCreators.get(username);
        if (!creator) {
            throw new Error("No auction creation process found for this user.");
        }

        const minionAHUser = await getLinkedMinionAHUser(creator.interaction.user.username);
        if (!minionAHUser) {
            throw new Error("No linked MinionAH account found for this user.");
        }

        const minionData = await prisma.minion.findFirst({
            where: {
                generator: creator.auctionOptions.minion_type.toUpperCase(),
                generator_tier: creator.auctionOptions.minion_tier
            }
        })

        if (!minionData) {
            throw new Error("Invalid minion type or tier provided for auction creation.");
        }
        await prisma.auction.create({
            data: {
                user_id: minionAHUser.user.id,
                minion_id: minionData.id,
                amount: creator.auctionOptions.quantity,
                price: creator.auctionOptions.price,
                hasFreeWill: creator.auctionOptions.free_will ?? false,
                hasInfusion: creator.auctionOptions.mithril_infusion ?? false,
                isNegotiable: creator.auctionOptions.negotiable ?? false,
            }
        })
    }

    public async getConfirmationDisplayContainer() {
        const minionData = await prisma.minion.findFirst({
            where: {
                generator: this.auctionOptions.minion_type.toUpperCase(),
                generator_tier: this.auctionOptions.minion_tier
            }
        })

        const botEmojis = await client.application?.emojis.fetch()

        if (!minionData || !botEmojis) throw new Error("Invalid minion type or tier provided for auction creation.");
        return new ContainerBuilder()
            .addTextDisplayComponents(
                (t) => t.setContent("### ⚠️ Confirm Auction Creation"),
                (t) => t.setContent("The following auction will be created with the provided options:"),
            )
            .addSeparatorComponents(
                s => s.setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                (t) => t.setContent(`**Minion Type:** ${resolveMinionEmoji(minionData.id, botEmojis)} ${minionData.name}`),
                (t) => t.setContent(`**Quantity:** ${this.auctionOptions.quantity}`),
                (t) => t.setContent(`**Price per Minion:** ${formatMinionPrice(this.auctionOptions.price)} coins`),
                (t) => t.setContent(`**Mithril Infusion:** ${this.auctionOptions.mithril_infusion ? "Yes" : "No"}`),
                (t) => t.setContent(`**Free Will:** ${this.auctionOptions.free_will ? "Yes" : "No"}`),
                (t) => t.setContent(`**Negotiable:** ${this.auctionOptions.negotiable ? "Yes" : "No"}`),
            )
            .addSeparatorComponents(
                s => s.setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                (t) => t.setContent(`*By [minionah.com](https://minionah.com).*`)
            )
            .addActionRowComponents(
                ar => ar.addComponents(
                    new ButtonBuilder()
                        .setCustomId("auction:create:confirm")
                        .setLabel("Confirm")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("auction:create:cancel")
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger)

                )
            )
    }

}