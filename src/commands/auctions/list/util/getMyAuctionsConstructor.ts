import { Auction } from "$generated/prisma/client";
import { prisma } from "$src/central.config";

interface GetAuctionsConfig {
    page: number;
    auctionsPerPage: number;
    minionType?: string;
    minionTier?: number;
    sortingOrder?: "asc" | "desc";
}

/**
 * Template function to get auctions for a specific user
 * @param userID 
 * @returns 
 */
export default function getMyAuctionsConstructor(userID: string) {
    return async function auctionGetter({
        page,
        auctionsPerPage,
        minionType,
        minionTier,
        sortingOrder
    }: GetAuctionsConfig) {
        const auctionsPromise: Promise<Auction[]> = prisma.auction.findMany({
            where: {
                // check for just minion type
                ...(minionType && !minionTier
                    ? { minion_id: { contains: minionType.toUpperCase() } }
                    : {}),
                // check for just minion tier
                ...(minionTier && !minionType
                    ? { minion_id: { endsWith: "\\_" + minionTier.toString() } }
                    : {}),
                // check for both minion type and tier
                ...(minionType && minionTier
                    ? {
                        minion_id: {
                            contains: minionType.toUpperCase(),
                            endsWith: "\\_" + minionTier
                        }
                    }
                    : {}),
                user_id: userID
            },
            ...(
                sortingOrder
                    ? { orderBy: { timeCreated: sortingOrder } }
                    : {}
            ),
            take: auctionsPerPage,
            skip: (page - 1) * auctionsPerPage
        });

        const auctionStatsPromise = prisma.auction.aggregate({
            _sum: {
                amount: true
            },
            _count: true,
            where: {
                // check for just minion type
                ...(minionType && !minionTier
                    ? { minion_id: { contains: minionType.toUpperCase() } }
                    : {}),
                // check for just minion tier
                ...(minionTier && !minionType
                    ? { minion_id: { endsWith: "\\_" + minionTier.toString() } }
                    : {}),
                // check for both minion type and tier
                ...(minionType && minionTier
                    ? {
                        minion_id: {
                            contains: minionType.toUpperCase(),
                            endsWith: "\\_" + minionTier
                        }
                    }
                    : {})
            }

        });

        const [auctions, auctionStatsResult] = await Promise.all([
            auctionsPromise,
            auctionStatsPromise
        ] as const);

        return {
            auctions,
            minionSum: auctionStatsResult._sum.amount || 0,
            auctionCount: auctionStatsResult._count || 0
        };
    }
}
