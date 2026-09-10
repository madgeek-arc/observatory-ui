import { colors } from "./chart-color-palette";

/** Same palette already used for these exact categories in explore.service.ts's
 *  map-building methods — kept in sync with that instead of reinventing colors. */
const POSITIVE_COLOR = colors[0];
const POSITIVE_SECONDARY_COLOR = colors[3];
const NEGATIVE_COLOR = colors[1];
/** Matches ColorPallet[2] in eosc-readiness-map-subtitles.ts — copied as a literal rather
 *  than imported, since that file lives in the (lazy-loaded) eosc-readiness-dashboard
 *  feature module and importing from it would pull that module's code into the explore bundle. */
const AWAITING_COLOR = '#a9a9a9';

const STATUS_COLORS: Record<string, string> = {
  'Mandatory policy': POSITIVE_COLOR,
  'Policy but not mandatory': POSITIVE_SECONDARY_COLOR,
  'No policy': NEGATIVE_COLOR,
  'Awaiting data': AWAITING_COLOR,
  'AWAITING_DATA': AWAITING_COLOR,
  'YES': POSITIVE_COLOR,
  'NO': NEGATIVE_COLOR,
};

const POSITIVE_VALUES = ['Mandatory policy', 'Policy but not mandatory', 'YES'];
const AWAITING_DATA_VALUES = ['Awaiting data', 'AWAITING_DATA'];

/** True for a "has the policy" status. A percentage-format indicator encodes yes/no
 *  per-country as 100/0 rather than as a string, so a plain 100 counts as positive too. */
export function isPositiveStatus(value: number | string): boolean {
  return typeof value === 'number' ? value === 100 : POSITIVE_VALUES.includes(value);
}

/** True when the country's status simply hasn't been collected yet — distinct from a
 *  confirmed "No", which is why it gets its own badge state instead of collapsing into No. */
export function isAwaitingData(value: number | string): boolean {
  return typeof value === 'string' && AWAITING_DATA_VALUES.includes(value);
}


export function colorForStatus(value: string): string {
  return STATUS_COLORS[value] ?? AWAITING_COLOR;
}

export interface CountryStatusBadge {
  text: string;
  color: string;
}

/** Simplified Yes/No/N-A badge for a per-country list — collapses every "has some form
 *  of policy" category into one Yes, colored to match the map's positive color. */
export function countryStatusBadge(value: number | string | undefined): CountryStatusBadge {
  if (value === undefined || isAwaitingData(value)) {
    return { text: 'N/A', color: AWAITING_COLOR };
  }
  return isPositiveStatus(value)
    ? { text: 'Yes', color: POSITIVE_COLOR }
    : { text: 'No', color: NEGATIVE_COLOR };
}
