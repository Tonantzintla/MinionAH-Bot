import axios from "axios";

interface MinionPrices {
    [key: string]: number
}

export default async function getMinionPrices(filter?: string, tier?: number): Promise<MinionPrices | null> {
    try {
        if (!process.env.PRICE_CHECKER_URL) throw new Error("PRICE_CHECKER_URL not found in environment variables.");
        const {data: minions} = await axios.get<MinionPrices>(process.env.PRICE_CHECKER_URL, {
            timeout: 15000
        });
        const filtered = filter && filter !== "_none" ? Object.fromEntries(Object.entries(minions).filter(([key]) => key.toLowerCase().includes(filter.toLowerCase()))) : minions;
        const filteredTiers = tier && tier !== -1 ? Object.fromEntries(Object.entries(filtered).filter(([key]) => parseInt(key.split("_").slice(-1)[0]) === tier)) : filtered;
        return filteredTiers;
    } catch (error) {
        console.error("Error in getMinionPrices: ", error);
        return null
    }
}