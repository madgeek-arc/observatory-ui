export type IndicatorFormat = 'percentage' | 'number' | 'currency' | 'category' | 'yes-no';
export type CountryScope = 'ALL_COUNTRIES' | 'SELECTED_COUNTRIES';
export type TimeScope = 'SINGLE_YEAR' | 'TIME_RANGE';

export type RenderStyle =
  /** All EU, single year — a single aggregate value; the unit (%, € millions, plain count) comes from `format`, not from this style. */
  | 'SCALAR'
  /** All EU, year range — single-series line chart. */
  | 'LINE_CHART'
  /** Selected countries, single year — one bar per country with the value printed on the right. */
  | 'PROGRESS_BARS'
  /** Selected countries, year range — one line series per selected country. */
  | 'MULTI_SERIES_LINE_CHART'
  /** Selected countries, single year — per-country yes/no. */
  | 'YES_NO'
  /** Selected countries, year range — per-country yes/no plus when it changed, if it did. */
  | 'YES_NO_TIMELINE'
  /** All EU, single year — choropleth. */
  | 'MAP'
  /** All EU, year range — choropleth plus a count of countries that changed since the start year. */
  | 'MAP_WITH_CHANGE_COUNT'
  /** All EU, year range — one column per year, split into stacked breakdown categories. */
  | 'STACKED_COLUMN'
  /** Selected countries, single year — one row per country, one dot per category on a 0–100 scale. */
  | 'PROGRESS_LINE_CHART'
  /** Selected countries, year range, with a selector — one mini line chart per selector
   *  category, one line per selected country inside each. */
  | 'MULTI_LINE_CHARTS'
  /** All EU, single year — graduated (numeric) choropleth plus a ranked top-5 countries list. */
  | 'CHOROPLETH_MAP_WITH_TOP_5'
  /** All EU, year range — one column per year, summed across all countries. */
  | 'COLUMN_CHART'
  /** Selected countries, year range — one column series per selected country,
   *  clustered by year. */
  | 'MULTI_SERIES_COLUMN_CHART'
  /** All EU, single year, with a selector — one bar per selector category. */
  | 'BAR_CHART'
  /** All EU, year range, with a selector — one bar per selector category,
   *  clustered by year. */
  | 'MULTI_SERIES_BAR_CHART'
  /** Selected countries, single year, with a selector — one row per selector
   *  category, one yes/no cell per country, plus an EU reference column. */
  | 'YES_NO_TABLE';

export interface IndicatorViewSelector {
  dimension: string;
  label: string;
  members: string[];
}

export interface IndicatorView {
  countryScope: CountryScope;
  timeScope: TimeScope;
  renderStyle: RenderStyle;
  selector?: IndicatorViewSelector;
  fullWidth: boolean;
}

export interface ExploreIndicatorConfig {
  id: string;
  indicatorCode: string;
  label: string;
  group: string;
  views: IndicatorView[];
  format: IndicatorFormat;
  allowedSeriesAggregations: string[];
  presetFilters?: Record<string, string[]>;
}
