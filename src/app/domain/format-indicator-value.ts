import { IndicatorFormat } from "./explore-indicators";

export function formatIndicatorValue(value: number, format: IndicatorFormat): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `€${(value / 1_000_000).toFixed(2)}M`;
    default:
      return `${value}`;
  }
}

/** formatIndicatorValue, but tolerant of the non-numeric values a query response
 *  can carry (e.g. a policy status string) — those simply have no formatted display. */
export function formatIfNumber(value: number | string | undefined, format: IndicatorFormat): string | undefined {
  return typeof value === 'number' ? formatIndicatorValue(value, format) : undefined;
}

const compactCurrencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1
});

/** Euro amount with an auto-picked unit — 12100000 -> "€12.1M", 2425586800000 -> "€2.4T". */
export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

/** Abbreviates a raw count for compact display — 1651818 -> "1.65M", 86837 -> "87k". */
export function formatCount(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return `${value}`;
}
