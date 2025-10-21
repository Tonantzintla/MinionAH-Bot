import { prisma } from "$src/central.config";

export default async function getLinkedMinionAHUser(discordUsername: string) {
  try {
    return await prisma.userOAuthProvider.findFirst({
      where: {
        providerUsername: discordUsername,
        provider: "discord"
      },
      include: {
        user: true
      }
    });
  } catch (error) {
    console.error("Error fetching linked minion AH user:", error);
    return null;
  }
}
