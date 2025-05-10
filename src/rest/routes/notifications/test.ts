import notif_test_schemaZod from "$rest/zod/notifications/notif_test_schema.zod.js";
import { client } from "$src/discord/client.js";
import { DiscordAPIError, EmbedBuilder } from "discord.js";
import e from "express";
import { z } from "zod";

export default async (req: e.Request, res: e.Response) => {
  try {
    // body is validated @ middleware level
    const data = req.body as z.infer<typeof notif_test_schemaZod>;

    const msgEmbed = getNotificationEmbed(data);

    const dmChannel = await getDMChannel(data.receiverDiscordID);

    await dmChannel.send({
      embeds: [msgEmbed]
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

function getNotificationEmbed(data: z.infer<typeof notif_test_schemaZod>) {
  return new EmbedBuilder().setTitle("Example Notification").setColor("#262626").setThumbnail(`${process.env.CLOUDINARY_URL}/image/upload/v1/users/avatars/${data.senderID}`).setDescription(`Hello <@${data.receiverDiscordID}>,\n\n If you can see this message, the bot can send you notifications successfully.`);
}

async function getDMChannel(user: string) {
  const userObj = client.users.cache.get(user) || (await client.users.fetch(user));
  return userObj.dmChannel || (await userObj.createDM());
}
