import { ContainerBuilder, SeparatorSpacingSize } from "discord.js";

/**
 * Various display containers used in the auction creation process. Specifically:
 * - invalidAuctionCreateDisplayContainer: Shown when the auction creation options are invalid.
 * - noLinkedMinionAHAccountFoundDisplayContainer: Shown when the user has no linked MinionAH account.
 * - confirmedAuctionCreationDisplayContainer: Shown when the auction creation is successfully confirmed.
 * - cancelledAuctionCreationDisplayContainer: Shown when the auction creation process is cancelled.
 */

const invalidAuctionCreateDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents(
        (t) => t.setContent("### Invalid Auction Creation")
    )
    .addTextDisplayComponents(
        (t) => t.setContent("The auction creation options provided are invalid. Please check your inputs and try again.")
    )
    .addSeparatorComponents(
        s => s.setSpacing(SeparatorSpacingSize.Large)
    )
    .addTextDisplayComponents(
        (t) => t.setContent(`*By [minionah.com](https://minionah.com).`)
    );

const noLinkedMinionAHAccountFoundDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents(
        (t) => t.setContent("### No Linked MinionAH Account Found")
    )
    .addTextDisplayComponents(
        (t) => t.setContent("You do not have a linked MinionAH account. Please link your account [here](https://minionah.com/profile/settings) to create auctions via the bot.")
    )
    .addSeparatorComponents(
        s => s.setSpacing(SeparatorSpacingSize.Large)
    )
    .addTextDisplayComponents(
        (t) => t.setContent(`*By [minionah.com](https://minionah.com).`)
    );

const confirmedAuctionCreationDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents(
        (t) => t.setContent("### ✅ Auction Creation Confirmed")
    )
    .addTextDisplayComponents(
        (t) => t.setContent("Your auction has been successfully created and is now live on MinionAH!")
    )
    .addSeparatorComponents(
        s => s.setSpacing(SeparatorSpacingSize.Large)
    )
    .addTextDisplayComponents(
        (t) => t.setContent(`*By [minionah.com](https://minionah.com).`)
    );

const cancelledAuctionCreationDisplayContainer = new ContainerBuilder()
    .addTextDisplayComponents(
        (t) => t.setContent("### ❌ Auction Creation Cancelled")
    )
    .addTextDisplayComponents(
        (t) => t.setContent("Your auction creation has been cancelled. You can start over anytime!")
    )
    .addSeparatorComponents(
        s => s.setSpacing(SeparatorSpacingSize.Large)
    )
    .addTextDisplayComponents(
        (t) => t.setContent(`*By [minionah.com](https://minionah.com).`)
    );

export {
    cancelledAuctionCreationDisplayContainer, confirmedAuctionCreationDisplayContainer, invalidAuctionCreateDisplayContainer,
    noLinkedMinionAHAccountFoundDisplayContainer
};
