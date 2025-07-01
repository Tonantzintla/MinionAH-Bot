import zod from "zod";

export default zod.object({
    receiverDiscordID: zod
        .string()
        .regex(/^\d{17,19}$/, "Discord ID must be a valid 17-19 digit number"),
    auctionIDs: zod.array(zod.string())
});