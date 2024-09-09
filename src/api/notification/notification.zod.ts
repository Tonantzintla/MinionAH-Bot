import zod from "zod";
export default zod.object({
  receiverDiscordID: zod
    .string()
    .regex(/^\d{18}$/, "Discord ID must be an 18 digit string."),
  senderUsername: zod.string(),
  senderID: zod
    .string()
    .length(32, { message: "UUID must be exactly 32 characters long" })
    .regex(/^[a-fA-F0-9]+$/, {
      message: "UUID must contain only hexadecimal characters (0-9, a-f, A-F)",
    }),
});
