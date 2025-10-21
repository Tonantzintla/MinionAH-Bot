import { ContainerBuilder, SeparatorSpacingSize } from "discord.js";

/**
 * Shown when the user has no linked MinionAH account.
 */
export default new ContainerBuilder()
    .addTextDisplayComponents((t) =>
        t.setContent("### No Linked MinionAH Account Found")
    )
    .addTextDisplayComponents((t) =>
        t.setContent(
            "You do not have a linked MinionAH account. Please link your account [here](https://minionah.com/profile/settings) to create auctions via the bot."
        )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents((t) =>
        t.setContent(`*By [minionah.com](https://minionah.com).`)
    );