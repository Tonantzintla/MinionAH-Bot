import { Auction } from "$generated/prisma/client";
import parseMinionType from "$lib/auctions/parseMinionType";
import formatMinionPrice from "$lib/prices/formatMinionPrice";
import resolveMinionEmoji from "$lib/resolveMinionEmoji";
import { client } from "$src/discord/client";
import {
  ApplicationEmoji,
  Collection,
  ContainerBuilder,
  SeparatorSpacingSize
} from "discord.js";
import constructPagination from "./constructPagination";
import constructSortingOrderSelect from "./constructSortingOrderSelect";
import getAuctionData from "./getAuctionData";

type AuctionDisplayParams = Awaited<ReturnType<typeof getAuctionData>> & {
  page: number;
  pageSize: number;
  currentSortingOrder?: "asc" | "desc";
  title: string;
};

export default async function constructAuctionPageDisplayContainer({
  auctions,
  auctionCount,
  minionSum,
  page,
  pageSize,
  currentSortingOrder,
  title
}: AuctionDisplayParams) {
  const botEmojis = await client.application?.emojis.fetch();

  if (!botEmojis) throw new Error("Bot emojis not found");

  const auctionsTextDisplay = auctions.length > 0
    ? auctions
      .map((auction, _) => constructAuctionDisplay(auction, botEmojis))
      .join("\n\n")
    : "No auctions found for the given criteria.";

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      (t) => t.setContent(`### ${title || "Auction Search"}`),
      (t) =>
        t.setContent(
          [
            `**Total Auctions:** ${auctionCount}`,
            `**Auctioned Minions:** ${minionSum}`
          ].join("\n")
        )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents((t) =>
      t.setContent(
        auctionsTextDisplay
      )
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents((t) =>
      t.setContent(
        `*By [minionah.com](https://minionah.com). Showing page ${page} of ${Math.ceil(auctionCount / pageSize)}*`
      )
    )
    .addActionRowComponents(constructSortingOrderSelect(currentSortingOrder))
    .addActionRowComponents(
      constructPagination({
        currentPage: page,
        totalPages: Math.ceil(auctionCount / pageSize)
      })
    );
  return container;
}

// `**${resolveMinionEmoji(auction.minion_id, botEmojis)} ${parseMinionType(auction.minion_id)}**`

function constructAuctionDisplay(
  auction: Auction,
  botEmojis: Collection<string, ApplicationEmoji>
) {
  return [
    `${resolveMinionEmoji(auction.minion_id, botEmojis)} **${parseMinionType(auction.minion_id)}**`,
    `Price: **${formatMinionPrice(auction.price)}**`,
    `Amount: **${auction.amount}**`,
    `Created: <t:${Math.floor(auction.timeCreated.getTime() / 1000)}:R>`,
    auction.timeBumped
      ? `Last Bumped: <t:${Math.floor(auction.timeBumped.getTime() / 1000)}:R>`
      : null,
    `Free Will: **${auction.hasFreeWill ? "Yes" : "No"}**`,
    `Mithril Infusion: **${auction.hasInfusion ? "Yes" : "No"}**`
  ]
    .filter(Boolean)
    .join("\n");
}
