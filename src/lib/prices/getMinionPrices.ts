import axios from "axios";

interface Minion {
    [key: string]: number
}

export default async function getMinionPrices() {
    try {
        if (!process.env.PRICE_CHECKER_URL) throw new Error("PRICE_CHECKER_URL not found in environment variables.");
        const {data: minions} = await axios.get<Minion>(process.env.PRICE_CHECKER_URL);
        return minions;
    } catch (error) {
        console.error("Error in getMinionPrices: ", error);
        return null
    }
}