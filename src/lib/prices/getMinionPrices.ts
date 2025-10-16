import { MinionOrderByWithRelationInput } from "$generated/prisma/models";
import { prisma } from "$src/central.config";

interface MinionPrices {
  id: string;
  name: string;
  generator: string;
  generator_tier: number;
  maxTier: number;
  craftCost: number;
}

export default async function getMinionPrices(
  filter?: string,
  tier?: number,
  orderBy?: MinionOrderByWithRelationInput | MinionOrderByWithRelationInput[]
): Promise<MinionPrices[] | null> {
  try {
    const minionPrices = await prisma.minion.findMany({
      orderBy,
    });
    const filtered =
      filter && filter !== "_none"
        ? minionPrices.filter((minion) =>
          minion.name.toLowerCase().includes(filter.toLowerCase())
        )
        : minionPrices;
    const filteredTiers =
      tier && tier !== -1
        ? filtered.filter((minion) => minion.generator_tier === tier)
        : filtered;
    return filteredTiers;
  } catch (error) {
    console.error("Error in getMinionPrices: ", error);
    return null;
  }
}
