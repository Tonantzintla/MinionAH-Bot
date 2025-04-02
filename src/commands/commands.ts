import auctions from "./auctions/auctions.js";
import discord from "./discord/discord.js";
import prices from "./price-check/prices.js";

export default [
    prices,
    auctions,
    discord
].map(command => command.toJSON());