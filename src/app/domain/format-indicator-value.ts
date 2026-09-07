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
