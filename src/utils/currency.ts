/** Formats monetary amounts consistently throughout the restaurant application. */
export function formatCurrency(value: number, symbol = "₹"): string {
  const amount = Number.isFinite(value) ? value : 0;
  return `${symbol}${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
