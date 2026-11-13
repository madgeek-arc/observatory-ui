import { IndicatorFormat } from "./explore-indicators";

/*
 * Number display rules for Custom Search:
 *  - up to 2 decimals, trailing zeros dropped      13.00 -> "13", 13.50 -> "13.5", 72.4137 -> "72.41"
 *  - .5 rounds up                                   13.455 -> "13.46"
 *  - from 1,000 up, shortened with K / M / B / T    8633 -> "8.63K", 322425688490000 -> "322.43T"
 *  - percentages always 2 decimals (only .00 drops) 75.3 -> "75.30%", 75 -> "75%"
 *  - euro amounts                                   "€322.43T"
 *
 * Every number on the page — card text and Highcharts data labels, tooltips and axes — goes through
 * these functions. Highcharts' own number formatting reads global settings (Highcharts.setOptions)
 * that other pages change, so Custom Search charts always pass a `formatter` instead of relying on it.
 */

/** Rounds to `decimals` places, with .5 always going up (away from zero) — 13.455 -> 13.46, -13.455 -> -13.46.
 *  toPrecision(15) first removes floating-point noise: 13.455 * 100 is stored as 1345.4999999999998,
 *  which a plain Math.round would send down to 1345. */
export function roundHalfUp(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  const scaled = Number((Math.abs(value) * factor).toPrecision(15));
  return Math.sign(value) * Math.round(scaled) / factor;
}

/** Shortens a number with K / M / B / T, keeping up to 2 decimals (trailing zeros dropped).
 *  950 -> "950", 87000 -> "87K", 1650000 -> "1.65M", 322425688490000 -> "322.43T".
 *  Keeps dividing by 1,000 while the rounded number is still 1,000 or more, so a value that
 *  rounds up to 1000 moves to the next letter: 999999 -> "1M", not "1000K". */
export function formatCompactNumber(value: number): string {
  const sign = value < 0 ? '-' : '';
  let number = Math.abs(value);
  let suffix = '';
  for (const nextSuffix of ['K', 'M', 'B', 'T']) {
    if (roundHalfUp(number) < 1000) {
      break;
    }
    number = number / 1000;
    suffix = nextSuffix;
  }
  return `${sign}${roundHalfUp(number)}${suffix}`;
}

/** Percentages always show 2 decimals so they line up across the page; only ".00" is dropped.
 *  72.4137 -> "72.41%", 75.3 -> "75.30%", 75 -> "75%".
 *  (Other numbers keep dropping every trailing zero: 1.4M stays "1.4M".) */
export function formatPercent(value: number): string {
  const text = roundHalfUp(value).toFixed(2);
  return `${text.endsWith('.00') ? text.slice(0, -3) : text}%`;
}

/** 12100000 -> "€12.1M", -1650000 -> "-€1.65M", 322425688490000 -> "€322.43T". */
export function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}€${formatCompactNumber(Math.abs(value))}`;
}

export function formatIndicatorValue(value: number, format: IndicatorFormat): string {
  switch (format) {
    case 'percentage':
      return formatPercent(value);
    case 'currency':
      return formatCurrency(value);
    default:
      return formatCompactNumber(value);
  }
}

/** Highcharts axis-label formatter that follows the same rules — ticks 0, 25, 50 on a percentage axis
 *  show as "0%", "25%", "50%"; on a currency axis 20000000 shows as "€20M".
 *  Usage: yAxis: { labels: { formatter: axisLabelFormatter('currency') } } */
export function axisLabelFormatter(format: IndicatorFormat) {
  return function (this: { value: number | string }): string {
    return formatIndicatorValue(Number(this.value), format);
  };
}

/** formatIndicatorValue, but tolerant of the non-numeric values a query response
 *  can carry (e.g. a policy status string) — those simply have no formatted display. */
export function formatIfNumber(value: number | string | null | undefined, format: IndicatorFormat): string | undefined {
  return typeof value === 'number' ? formatIndicatorValue(value, format) : undefined;
}
