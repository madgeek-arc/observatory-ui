import { IndicatorFormat } from "./explore-indicators";

export function formatIndicatorValue(value: number, format: IndicatorFormat): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `€${(value / 1_000_000).toFixed(1)}M`;
    default:
      return `${value}`;
  }
}

/** formatIndicatorValue, but tolerant of the non-numeric values a query response
 *  can carry (e.g. a policy status string) — those simply have no formatted display. */
export function formatIfNumber(value: number | string | undefined, format: IndicatorFormat): string | undefined {
  return typeof value === 'number' ? formatIndicatorValue(value, format) : undefined;
}
