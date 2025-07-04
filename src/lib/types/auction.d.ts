export namespace Auction {
  interface AuctionOptions {
    type: string;
    tier: number;
    amount: number;
    price: number;
    mithrilInfused: boolean;
    freeWill: boolean;
    negotiable: boolean;
    _discordExecutor: string; // discord ID of the user initiating the auction creation
  }
}
