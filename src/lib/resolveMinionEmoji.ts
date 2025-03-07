import { ApplicationEmoji, Collection } from "discord.js";

/**
* Resolves the emoji from the bot emojis
* @param minion the minion name
* @param botEmojis the bot emojis
* @returns the resolved emoji
*/
export default function resolveMinionEmoji(minion: string, botEmojis: Collection<string, ApplicationEmoji>) {
   const emoji = botEmojis.find(emoji => emoji.name === minion);
   if (!emoji) return "<:ZOMBIE_GENERATOR_1:1284520647984152731>"
   return `<:${minion}:${emoji?.id}>`;
}