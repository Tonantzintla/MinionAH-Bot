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
    .setAuthor({
      name: data.senderUsername,
      iconURL: `${process.env.CLOUDINARY_URL}/image/upload/v1/users/avatars/${data.senderID}`,
    })
    .setTitle("Direct Message")
    .setDescription(
      "-# if you no longer want to receive DM's for when someone send you a message, you can turn off Discord notifications in [your notification settings](<https://minionah.com/profile/settings/notifications>)"
    );

  const chatBtn = new ButtonBuilder({
    style: ButtonStyle.Link,
    url: `https://minionah.com/user/${data.senderUsername}/chat`,
    label: "Open chat",
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
