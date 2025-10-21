import { ContainerBuilder, SeparatorSpacingSize } from "discord.js";

export default new ContainerBuilder()
  .addTextDisplayComponents((t) => t.setContent("### An Error Occurred"))
  .addTextDisplayComponents((t) =>
    t.setContent(
      "Sorry, something went wrong while processing your request. Please report this error to the MinionAH Developers."
    )
  )
  .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
  .addTextDisplayComponents((t) =>
    t.setContent(`*By [minionah.com](https://minionah.com).*`)
  );
