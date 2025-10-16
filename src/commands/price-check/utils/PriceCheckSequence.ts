import getMinionPrices from "$lib/prices/getMinionPrices";
import constructPriceCheckDisplayContainer from "./constructPriceCheckDisplayContainer";

interface GetPriceCheckParams {
    username: string,
    minionType?: string;
    minionTier?: number;
    explicitlyCreate?: boolean
}

const priceCheckConfig = {
    pricesPerPage: 10,
}

export default class PriceCheckSequence {
    private static instances: Map<string, PriceCheckSequence> = new Map();
    private minionType?: string;
    private minionTier?: number;
    public currentPageNumber: number = 1;

    private constructor({ minionType, minionTier }: { minionType?: string; minionTier?: number }) {
        this.minionType = minionType;
        this.minionTier = minionTier;
    }

    public async getCurrentPage() {
        this.currentPageNumber--;
        return this.nextPage();
    }

    public navigateToPage(page: number) {
        if (isNaN(page)) page = 0;
        this.currentPageNumber = Math.max(0, page - 1);
        return this.nextPage();
    }

    public async previousPage() {
        this.currentPageNumber = Math.max(0, this.currentPageNumber - 2);
        return this.nextPage();
    }

    public static getSequence({
        username, minionType, minionTier, explicitlyCreate = false
    }: GetPriceCheckParams) {
        const existingInstance = this.instances.get(username);
        if (existingInstance && !explicitlyCreate) {
            return existingInstance;
        } else {
            const newInstance = new PriceCheckSequence({ minionType, minionTier });
            this.instances.set(username, newInstance);
            return newInstance;
        }
    }

    public async nextPage() {
        this.currentPageNumber++;

        const priceData = await getMinionPrices(this.minionType, this.minionTier, {
            craftCost: "asc"
        });
        if (!priceData) throw new Error("Failed to fetch price data.");

        return {
            priceData,
            visualContainer: await constructPriceCheckDisplayContainer({
                priceData,
                currentPage: this.currentPageNumber,
                pageSize: priceCheckConfig.pricesPerPage
            })
        }
    }
}