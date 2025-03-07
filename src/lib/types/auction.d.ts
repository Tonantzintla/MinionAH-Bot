export namespace Auction {
    interface AuctionOptions {
        type: string;
        tier: number;
        amount: number;
        price: number;
        mithrilInfused: boolean;
        freeWill: boolean;
    }

    interface FetchedAuctionData {}
}