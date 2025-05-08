import getMinionTypes from "$lib/auctions/getMinionTypes.js";

/**
 * Validates a plaintext minion type and tier
 * @param type a type of minion in plain text (eg. Creeper/Spider)
 * @param tier a tier of minion (1-12)
 * @returns an object indicating the validity of the minion type, the actual minion ID, and if there was a system error
 */
export default async function validatePlaintextMinionType(type: string, tier: number) {
    try {
        const minionIDs = await getMinionTypes(true); // returns raw minion types
        if (!minionIDs) throw new Error("No minion types found");
        const validMinionIDs = minionIDs.filter(ID => ID.includes(type.toUpperCase()) && ID.split("_").slice(-1)[0] === tier.toString())
        return {
            systemError: false,
            valid: validMinionIDs.length === 1,
            validMinionID: validMinionIDs[0]
        }
    } catch (error) {
        console.error(error);
        return {
            valid: false,
            systemError: true
        }
    }
}