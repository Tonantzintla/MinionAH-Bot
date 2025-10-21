import constructAuctionPageDisplayContainer from "./constructAuctionPageDisplayContainer";
import getAuctionData from "./getAuctionData";

interface SequenceConstructorParams {
  minionType?: string;
  minionTier?: number;
  overrideDefaultAuctionGetter?: typeof getAuctionData;
  customTitle?: string;
}

interface SequenceGetParams extends SequenceConstructorParams {
  username: string;
  explicitlyCreate?: boolean;
}

const searchConfig = {
  auctionsPerPage: 5
};

/**
 * This class handles auction searching for a specific user. It maintains state and
 * provides pagination. The ability to have switchable auction getters allows the reuse
 * of the class in different auction searching contexts (generic (/auctions search), user-specific (/auctions list) etc)
 *
 * notes:
 * - intermediate constructor: getSequence (calls private constructor)
 * - object scope: user
 */
export default class SearchSequence {
  private static instances: Map<string, SearchSequence> = new Map();
  private minionType?: string;
  private minionTier?: number;
  public currentPageNumber: number = 1;
  private sortingOrder: "asc" | "desc" | undefined = "desc";
  private auctionGetter: typeof getAuctionData = getAuctionData;
  private title = "Auction Search";

  private constructor({
    minionType,
    minionTier,
    overrideDefaultAuctionGetter,
    customTitle
  }: SequenceConstructorParams) {
    this.minionType = minionType;
    this.minionTier = minionTier;
    if (overrideDefaultAuctionGetter)
      this.auctionGetter = overrideDefaultAuctionGetter;
    if (customTitle) this.title = customTitle;
  }

  public static getSequence({
    username,
    minionType,
    minionTier,
    explicitlyCreate = false,
    overrideDefaultAuctionGetter,
    customTitle
  }: SequenceGetParams) {
    const existingInstance = this.instances.get(username);
    if (existingInstance && !explicitlyCreate) {
      return existingInstance;
    } else {
      const newInstance = new SearchSequence({
        minionType,
        minionTier,
        overrideDefaultAuctionGetter,
        customTitle
      });
      this.instances.set(username, newInstance);
      return newInstance;
    }
  }

  public changeSortingOrder(newOrder: "asc" | "desc" | "none") {
    if (newOrder === "none") {
      this.sortingOrder = undefined;
    } else {
      this.sortingOrder = newOrder;
    }
  }

  public async getCurrentPage() {
    this.currentPageNumber--;
    return this.nextPage();
  }

  public navigateToPage(page: number) {
    if (isNaN(page)) page = 0;
    this.currentPageNumber = Math.max(0, page - 1);
    return this.nextPage();
  }

  public async previousPage() {
    this.currentPageNumber = Math.max(0, this.currentPageNumber - 2);
    return this.nextPage();
  }

  public async nextPage() {
    this.currentPageNumber += 1;

    const auctionData = await this.auctionGetter({
      auctionsPerPage: searchConfig.auctionsPerPage,
      page: this.currentPageNumber,
      minionType: this.minionType,
      minionTier: this.minionTier,
      sortingOrder: this.sortingOrder
    });

    return {
      auctionData,
      visualContainer: await constructAuctionPageDisplayContainer({
        ...auctionData,
        page: this.currentPageNumber,
        pageSize: searchConfig.auctionsPerPage,
        currentSortingOrder: this.sortingOrder,
        title: this.title
      })
    };
  }
}
