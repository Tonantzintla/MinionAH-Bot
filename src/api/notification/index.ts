import { Router } from "express";
import authMiddleware from "../lib/middlewares/auth.js";
import notifZod from "./notification.zod.js";
import zodParserMW from "../lib/middlewares/parser.js";
import { client } from "../../discord/client.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
const notifications = Router();

notifications.use(authMiddleware);
notifications.post("/", zodParserMW(notifZod), async (req, res) => {
  const data = req.body as NotificationData;

  const user = await client.users.fetch(data.receiverDiscordID);
  if (!user) return res.send({});

  let dm = user.dmChannel;
  if (!dm) dm = await user.createDM();

  const msgEmbed = new EmbedBuilder()
    .setTitle("You have a new message")
    .setColor("#2b2d31")
    .setThumbnail(
      `${process.env.CLOUDINARY_URL}/image/upload/v1/users/avatars/${data.senderID}`
    )
    .setDescription(
      `Hello <@${data.receiverDiscordID}>,\n\n${data.senderUsername} has sent you a message on MinionAH\n-# Don't want to receive these notifications? [Manage your notification settings](<https://minionah.com/profile/settings/notifications>)`
    );

  const chatBtn = new ButtonBuilder({
    style: ButtonStyle.Link,
    url: `https://minionah.com/user/${data.senderUsername}/chat`,
    label: "View Message",
  });
  const btnRow = new ActionRowBuilder<ButtonBuilder>({
    components: [chatBtn],
  });

  const msg = await dm.send({
    embeds: [msgEmbed],
    components: [btnRow],
  });
  return res.send(msg.toJSON());
});

export default notifications;
