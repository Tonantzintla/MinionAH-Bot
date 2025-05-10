/**
 * Formats a number to a string with a suffix
 * @param num the number to format
 * @returns the formatted number
 */
export default function formatMinionPrice(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.0$/, "") + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(0).replace(/\.0$/, "") + "K";
  } else {
    return num.toFixed(0);
  }
}
