import parseMinionType from "$lib/auctions/parseMinionType";
import resolveMinionEmoji from "$lib/resolveMinionEmoji";
import { prisma } from "$src/central.config";
import { client } from "$src/discord/client";
import { getDMChannel } from "$src/discord/getDMChannel";
import notif_expiring_auctions_schemaZod from "$src/rest/zod/notifications/notif_expiring_auctions_schema.zod";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  EmbedBuilder
} from "discord.js";
import e from "express";
import { z } from "zod";

export default async function expiring_auctions(
  req: e.Request,
  res: e.Response
) {
  try {
    const { auctionIDs, receiverDiscordID } = req.body as z.infer<
      typeof notif_expiring_auctions_schemaZod
    >;

    if (auctionIDs.length === 0) {
      res.status(400).json({ error: "No auction IDs provided" });
      return;
    }

    const embed = await getNotificationEmbed(auctionIDs, receiverDiscordID);

    const buttonRow = getButtonRow();

    const dmChannel = await getDMChannel(receiverDiscordID);

    await dmChannel.send({
      embeds: [embed],
      components: [buttonRow]
    });
    res.status(200).json({
      message: "Notification sent successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: String(error) });
  }
}

async function getNotificationEmbed(
  auctionIDs: string[],
  receiverDiscordID: string
) {
  const auctions = await prisma.auction.findMany({
    where: {
      id: { in: auctionIDs }
    }
  });

  const emojis = (await client.application?.emojis.fetch()) || new Collection();
  const auctionsDetails = auctions.map((auction) => {
    const emoji = resolveMinionEmoji(auction.minion_id, emojis);
    return `• ${emoji} ${auction.amount}x **${parseMinionType(auction.minion_id)}**`;
  });

  return new EmbedBuilder()
    .setTitle("Auctions Expiring Soon!")
    .setColor("#262626")
    .setThumbnail("https://minionah.com/favicon.ico")
    .setDescription(
      [
        `Hello <@${receiverDiscordID}>,`,
        `${auctions.length} of your auctions are about to expire!`,
        auctionsDetails.join("\n")
      ].join("\n\n")
    )
    .setFooter({
      text: "by MinionAH",
      iconURL: "https://minionah.com/favicon.ico"
    });
}

function getButtonRow() {
  const manageBtn = new ButtonBuilder({
    style: ButtonStyle.Link,
    url: `https://minionah.com/profile/settings/notifications`,
    label: "Manage Notifications"
  });
  return new ActionRowBuilder<ButtonBuilder>({
    components: [manageBtn]
  });
}
