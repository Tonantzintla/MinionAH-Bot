import { prisma } from "$src/central.config";

export default async function getMinionTypes(
  raw: boolean = false
): Promise<string[]> {
  // if (raw) {
  //   return minionTypesRaw;
  // }
  // return minionTypes;
  try {
    const minionTypes = await prisma.minion.findMany({
      select: {
        generator: true,
        id: true
      }
    });
    if (raw) return minionTypes.map((m) => m.id);

    return Array.from(
      new Set(
        minionTypes.map(
          (m) =>
            `${m.generator[0].toUpperCase()}${m.generator.slice(1).toLowerCase()}`
        )
      )
    );
  } catch (error) {
    console.error("Error fetching minion types:", error);
    return [];
  }
}
