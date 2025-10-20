import { ContainerBuilder, SeparatorSpacingSize } from "discord.js";

export default new ContainerBuilder()
    .addTextDisplayComponents(
        t => t.setContent("### ⚠️ Unauthorized Command")
    )
    .addSeparatorComponents(t => t.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents(
        t => t.setContent(
            "You do not have the necessary permissions to execute this command."
        )
    );