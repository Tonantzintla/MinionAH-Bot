import zod from "zod";
export default zod.object({
  receiverDiscordID: zod.string(),
  senderUsername: zod.string(),
  senderID: zod.string(),
});
