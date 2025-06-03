import zod from "zod";
export default zod.object({
  receiverDiscordID: zod
    .string()
    .regex(/^\d{17,19}$/, "Discord ID must be a valid 17-19 digit number"),
  senderUsername: zod.string(),
  senderID: zod
    .string()
    .length(32, { message: "UUID must be exactly 32 characters long" })
    .regex(/^[a-fA-F0-9]+$/, {
      message: "UUID must contain only hexadecimal characters (0-9, a-f, A-F)"
    })
});
