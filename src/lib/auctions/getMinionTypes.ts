import getMinionPrices from "../prices/getMinionPrices.js";

export default async function getMinionTypes(raw: boolean = false): Promise<string[] | null> {
    try {
        const prices = await getMinionPrices();
        if (!prices) throw new Error("No prices found");
        const minionTypes = Object.keys(prices);
        if (raw) return minionTypes;
        let options: string[] = [];
        for (const minType of minionTypes) {
            const normalized = [minType.split("_")[0]].map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
            if (!options.includes(normalized)) options.push(normalized);
        }
        return options
    } catch (error) {
        console.error(error);
        return null
    }
}