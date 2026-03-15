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
      showNavigationModal: false,
      targetPage: currentPage - 2
    }),
    boundariedButton({
      minValue: 2,
      maxValue: Math.max(2, totalPages - 3),
      showNavigationModal: false,
      targetPage: currentPage - 1
    }),
    // always nav - ignore boundaries
    boundariedButton({
      minValue: 3,
      maxValue: Math.max(3, totalPages - 2),
      showNavigationModal: true,
      targetPage: currentPage
    }),
    boundariedButton({
      minValue: 3,
      maxValue: Math.max(3, totalPages - 2),
      showNavigationModal: false,
      targetPage: currentPage >= 3 ? currentPage : currentPage + 1
    }),
    boundariedButton({
      minValue: 4,
      maxValue: Math.max(4, totalPages - 1),
      showNavigationModal: false,
      targetPage: currentPage >= 3 ? currentPage + 1 : currentPage + 2
    })
  );
  return [upper_pagination, lower_pagination];
}

function boundariedButton({
  minValue,
  maxValue,
  showNavigationModal,
  targetPage,
  // dont remove. might assist in disabling current page button in the future. this is intentional
  disabled = false
}: {
  minValue: number;
  maxValue: number;
  showNavigationModal: boolean;
  targetPage: number;
  disabled?: boolean;
}) {
  if (showNavigationModal) {
    return new ButtonBuilder()
      .setEmoji("🔢")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("price-check:page:go-to")
  }
  const displayedPage = Math.min(Math.max(targetPage, minValue), maxValue);
  return new ButtonBuilder()
    .setLabel(displayedPage.toString())
    .setCustomId(`price-check:page:navigate-absolute:${displayedPage}`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(disabled)
}
