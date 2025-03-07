import auctions from "./auctions/auctions.js";
import prices from "./price-check/prices.js";

export default [
    prices,
    auctions
].map(command => command.toJSON());