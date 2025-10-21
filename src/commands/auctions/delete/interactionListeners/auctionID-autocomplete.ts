import { Auction } from "$generated/prisma/client";
import formatMinionPrice from "$lib/prices/formatMinionPrice";
import { romanise } from "$lib/prices/romanise";
import { kv, prisma } from "$src/central.config";
import { client } from "$src/discord/client";
import getLinkedMinionAHUser from "$src/shared/user/getLinkedMinionAHUser";


/**
 * Handles the autocomplete interaction for the auction ID
 * option in the auctions delete command, option `auction
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isAutocomplete()) return;
  if (interaction.commandName !== "auctions") return;
  if (interaction.options.getSubcommand() !== "delete") return;
  if (interaction.options.getFocused(true).name !== "auction") return;

  try {
    // init
    const botEmojis = await client.application?.emojis.fetch();
    const auctions = await getUserAuctions(interaction.user.username);
    if (!auctions || !botEmojis) {
      await interaction.respond([]);
      return;
    }
    // get output values based on focused value
    const focusedValue = interaction.options.getFocused() as string;
    const filtered = auctions
      .filter((auction) => auction.id.startsWith(focusedValue))
      .slice(0, 10);
    const response = filtered.map((auction) => ({
      name: [
        `${normalizeMinionDisplayName(auction.minion_id)}`,
        `x${auction.amount}`,
        `${formatMinionPrice(auction.price)}/minion`,
        `Infusion: ${auction.hasInfusion ? "✅" : "❌"}`,
        `Free Will: ${auction.hasFreeWill ? "✅" : "❌"}`,
        `Negotiable: ${auction.isNegotiable ? "✅" : "❌"}`
      ].join(" | "),
      value: auction.id
    }));
    await interaction.respond(response);
  } catch (error) {
    console.error("Error fetching user auctions:", error);
    await interaction.respond([]);
  }
});

async function getUserAuctions(username: string) {
  const existingAuctions = kv.get<Auction[]>(`user:auctions_cache:${username}`);
  if (existingAuctions) return existingAuctions;
  const linkedUser = await getLinkedMinionAHUser(username);
  if (!linkedUser) return null;
  const auctions = await prisma.auction.findMany({
    where: {
      user_id: linkedUser.user.id
    }
  });
  // 1 minute cache. we dont stress the db for the duration of the
  // command and we also get a fair refresh rate
  kv.set(`user:auctions_cache:${username}`, auctions, 60);
  return auctions;
}

function normalizeMinionDisplayName(minionID: string) {
  const name = minionID.split("_")[0];
  const tier = minionID.split("_").slice(-1)[0];

  return `${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()} ${romanise(parseInt(tier))}`;
}
