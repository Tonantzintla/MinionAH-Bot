import notif_send_schemaZod from "$rest/zod/notifications/notif_send_schema.zod.js";
import { client } from "$src/discord/client.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError, EmbedBuilder } from "discord.js";
import e from "express";
import { z } from "zod";

export default async (req: e.Request, res: e.Response) => {
  try {
    // body is validated @ middleware level
    const data = req.body as z.infer<typeof notif_send_schemaZod>;

    const msgEmbed = getNotificationEmbed(data);

    const btnRow = getButtonRow(data);

    const dmChannel = await getDMChannel(data.receiverDiscordID);

    await dmChannel.send({
      embeds: [msgEmbed],
      components: [btnRow]
    });

    res.status(200).json({
      message: "Notification sent successfully"
    });
  } catch (error) {
    const err = error as DiscordAPIError;
    console.error(error);
    res.status(500).json(err.rawError);
  }
};

function getNotificationEmbed(data: z.infer<typeof notif_send_schemaZod>) {
  return new EmbedBuilder().setTitle("You have a new message").setColor("#262626").setThumbnail(`${process.env.CLOUDINARY_URL}/image/upload/v1/users/avatars/${data.senderID}`).setDescription(`Hello <@${data.receiverDiscordID}>,\n\n**${data.senderUsername}** has sent you a message`);
}

function getButtonRow(data: z.infer<typeof notif_send_schemaZod>) {
  const chatBtn = new ButtonBuilder({
    style: ButtonStyle.Link,
    url: `https://minionah.com/user/${data.senderUsername}/chat`,
    label: "View Chat"
  });

  const manageBtn = new ButtonBuilder({
    style: ButtonStyle.Link,
    url: `https://minionah.com/profile/settings/notifications`,
    label: "Manage Notifications"
  });
  return new ActionRowBuilder<ButtonBuilder>({
    components: [chatBtn, manageBtn]
  });
}

async function getDMChannel(user: string) {
  const userObj = client.users.cache.get(user) || (await client.users.fetch(user));
  return userObj.dmChannel || (await userObj.createDM());
}
