import formatMinionPrice from "$lib/prices/formatMinionPrice";
import getMinionPrices from "$lib/prices/getMinionPrices";
import resolveMinionEmoji from "$lib/resolveMinionEmoji";
import { client } from "$src/discord/client";
import { ContainerBuilder, SeparatorSpacingSize } from "discord.js";
import constructPriceCheckPagination from "./constructPriceCheckPagination";

export default async function constructPriceCheckDisplayContainer({
  priceData,
  currentPage,
  pageSize
}: {
  priceData: Awaited<ReturnType<typeof getMinionPrices>>;
  currentPage: number;
  pageSize: number;
}) {
  if (!priceData) throw new Error("No price data available.");
  const botEmojis = await client.application?.emojis.fetch();
  if (!botEmojis) throw new Error("Bot emojis not found");
  const pageItems = priceData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const pageItemsContentTransformed = pageItems
    .map(
      (minion) =>
        `${resolveMinionEmoji(minion.id, botEmojis)} ${minion.name} ~ \`${formatMinionPrice(minion.craftCost)}\``
    )
    .join("\n");

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      (t) => t.setContent("### Minion Prices"),
      (t) =>
        t.setContent(
          `\n\nSee the craft cost of each minion and tier so you can make the best decision when buying or selling minions.`
        )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents((t) =>
      t.setContent(
        pageItemsContentTransformed.length > 0
          ? pageItemsContentTransformed
          : "No minion data available on this page."
      )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents((t) =>
      t.setContent(
        `*By [minionah.com](https://minionah.com). Showing page ${currentPage} of ${Math.ceil(priceData.length / pageSize)}*`
      )
    )
    .addActionRowComponents(
      ...constructPriceCheckPagination({
        currentPage,
        totalPages: Math.ceil(priceData.length / pageSize)
      })
    );
  return container;
}
