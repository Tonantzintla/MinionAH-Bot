import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default function constructPriceCheckPagination({
  currentPage,
  totalPages
}: {
  currentPage: number;
  totalPages: number;
}) {
  const upper_pagination = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setEmoji("⏪")
      .setCustomId("price-check:page:navigate-offset:-2")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage - 2 < 1),
    new ButtonBuilder()
      .setEmoji("⬅️")
      .setCustomId("price-check:page:navigate-offset:-1")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage - 1 < 1),
    new ButtonBuilder()
      .setLabel("​")
      .setStyle(ButtonStyle.Link)
      .setURL("https://minionah.com/pricecheck"),
    new ButtonBuilder()
      .setEmoji("➡️")
      .setCustomId("price-check:page:navigate-offset:1")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage + 1 > totalPages),
    new ButtonBuilder()
      .setEmoji("⏩")
      .setCustomId("price-check:page:navigate-offset:2")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage + 2 > totalPages)
  );

  const lower_pagination = new ActionRowBuilder<ButtonBuilder>().addComponents(
    boundariedButton({
      minValue: 1,
      maxValue: Math.max(1, totalPages - 4),
      showNavigationModal: currentPage === 1,
      targetPage: currentPage - 2
    }),
    boundariedButton({
      minValue: 2,
      maxValue: Math.max(2, totalPages - 3),
      showNavigationModal: currentPage === 2,
      targetPage: currentPage - 1
    }),
    boundariedButton({
      minValue: 3,
      maxValue: Math.max(3, totalPages - 2),
      showNavigationModal: currentPage >= 3,
      targetPage: currentPage
    }),
    boundariedButton({
      minValue: 4,
      maxValue: Math.max(4, totalPages - 1),
      showNavigationModal: false,
      targetPage: currentPage + 1
    }),
    boundariedButton({
      minValue: 5,
      maxValue: Math.max(5, totalPages),
      showNavigationModal: false,
      targetPage: currentPage + 2
    })
  );
  return [upper_pagination, lower_pagination];
}

function boundariedButton({
  minValue,
  maxValue,
  showNavigationModal,
  targetPage
}: {
  minValue: number;
  maxValue: number;
  showNavigationModal: boolean;
  targetPage: number;
}) {
  if (showNavigationModal) {
    return new ButtonBuilder()
      .setLabel("​")
      .setEmoji("🔢")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("price-check:page:go-to");
  }
  const displayedPage = Math.min(Math.max(targetPage, minValue), maxValue);
  return new ButtonBuilder()
    .setLabel(displayedPage.toString())
    .setCustomId(`price-check:page:navigate-absolute:${displayedPage}`)
    .setStyle(ButtonStyle.Primary);
}
