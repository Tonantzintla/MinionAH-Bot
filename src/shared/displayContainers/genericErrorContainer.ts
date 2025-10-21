import { ContainerBuilder, SeparatorSpacingSize } from "discord.js";

export default new ContainerBuilder()
  .addTextDisplayComponents((t) => t.setContent("### An Error Occurred"))
  .addTextDisplayComponents((t) =>
    t.setContent(
      "Sorry, something went wrong while processing your request. Please contact @andriotis and tell him to deal with the mess"
    )
  )
  .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
  .addTextDisplayComponents((t) =>
    t.setContent(`*By [minionah.com](https://minionah.com).*`)
  );
