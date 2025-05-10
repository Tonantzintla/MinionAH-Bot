import auctions from "./auctions/auctions.js";
import maintenance from "./maintenance/maintenance.js";
import prices from "./price-check/prices.js";
// import discord from "./discord/discord.js";

export default [
  prices,
  auctions,
  maintenance
  // discord
].map((command) => command.toJSON());
