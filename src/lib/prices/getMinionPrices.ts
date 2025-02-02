import axios from "axios";

interface MinionPrices {
    [key: string]: number
}

export default async function getMinionPrices(filter?: string): Promise<MinionPrices | null> {
    try {
        if (!process.env.PRICE_CHECKER_URL) throw new Error("PRICE_CHECKER_URL not found in environment variables.");
        const {data: minions} = await axios.get<MinionPrices>(process.env.PRICE_CHECKER_URL, {
            timeout: 15000
        });
        return filter ? Object.fromEntries(Object.entries(minions).filter(([key]) => key.toLowerCase().includes(filter.toLowerCase()))) : minions;
    } catch (error) {
        console.error("Error in getMinionPrices: ", error);
        return null
    }
}