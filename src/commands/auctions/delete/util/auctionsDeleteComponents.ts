import { Auction } from "$generated/prisma/client";
import formatMinionPrice from "$lib/prices/formatMinionPrice";
import resolveMinionEmoji from "$lib/resolveMinionEmoji";
import { prisma } from "$src/central.config";
import { client } from "$src/discord/client";
import { ButtonBuilder, ButtonStyle, ContainerBuilder, SeparatorSpacingSize } from "discord.js";

const auctionNotFoundDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents((t) =>
        t.setContent("### Auction Not Found")
    )
    .addTextDisplayComponents((t) =>
        t.setContent(
            "The auction you are looking for could not be found. It may have been removed or the ID is incorrect. If you entered the ID manually, please double-check it and try again."
        )
    )
    .addTextDisplayComponents((t) =>
        t.setContent(`*By [minionah.com](https://minionah.com).*`)
    );

const auctionDeletionSuccessDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents((t) =>
        t.setContent("### ✅ Auction Deleted Successfully")
    )
    .addTextDisplayComponents((t) =>
        t.setContent(
            "The auction has been successfully deleted from the MinionAH marketplace."
        )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents((t) =>
        t.setContent(`*By [minionah.com](https://minionah.com).*`)
    );

const auctionDeletionCancelledDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents((t) =>
        t.setContent("### ❌ Auction Deletion Cancelled")
    )
    .addTextDisplayComponents((t) =>
        t.setContent(
            "The auction deletion process has been cancelled. No changes were made to your auctions."
        )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents((t) =>
        t.setContent(`*By [minionah.com](https://minionah.com).*`)
    );

const pendingDeletionExpiredDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents((t) =>
        t.setContent("### ⏳ Pending Deletion Expired")
    )
    .addTextDisplayComponents((t) =>
        t.setContent(
            "The pending auction deletion request has expired. Please initiate the deletion process again if you still wish to delete the auction."
        )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents((t) =>
        t.setContent(`*By [minionah.com](https://minionah.com).*`)
    );

async function constructAuctionDeleteConfirmationDisplayContainer(auction: Auction) {
    const minionData = await prisma.minion.findUnique({
        where: {
            id: auction.minion_id
        }
    });
    const botEmojis = await client.application?.emojis.fetch()
    if (!minionData || !botEmojis) return null
    return new ContainerBuilder()
        .addTextDisplayComponents(
            (t) => t.setContent("### ⚠️ Confirm Auction Creation"),
            (t) =>
                t.setContent(
                    "The following auction will be created with the provided options:"
                )
        )
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(
            (t) =>
                t.setContent(
                    `**Minion Type:** ${resolveMinionEmoji(minionData.id, botEmojis)} ${minionData.name}`
                ),
            (t) => t.setContent(`**Quantity:** ${auction.amount}`),
            (t) =>
                t.setContent(
                    `**Price per Minion:** ${formatMinionPrice(auction.price)} coins`
                ),
            (t) =>
                t.setContent(
                    `**Mithril Infusion:** ${auction.hasInfusion ? "Yes" : "No"}`
                ),
            (t) =>
                t.setContent(
                    `**Free Will:** ${auction.hasFreeWill ? "Yes" : "No"}`
                ),
            (t) =>
                t.setContent(
                    `**Negotiable:** ${auction.isNegotiable ? "Yes" : "No"}`
                )
        )
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents((t) =>
            t.setContent(`*By [minionah.com](https://minionah.com).*`)
        )
        .addActionRowComponents((ar) =>
            ar.addComponents(
                new ButtonBuilder()
                    .setCustomId("auction:delete:confirm")
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("auction:delete:cancel")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger)
            )
        );
}


export default {
    static: {
        auctionNotFoundDisplayContainer,
        auctionDeletionSuccessDisplayContainer,
        auctionDeletionCancelledDisplayContainer,
        pendingDeletionExpiredDisplayContainer
    },
    constructors: {
        constructAuctionDeleteConfirmationDisplayContainer
    }
}