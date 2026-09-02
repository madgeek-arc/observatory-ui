import { Component, computed, input, output } from "@angular/core";
import { CountryScope, ExploreIndicatorConfig, RenderStyle, TimeScope } from "../../../domain/explore-indicators";
import { EuSnapshotCardView } from "./eu-snapshot-card-view/eu-snapshot-card-view";
import { EuTrendCardView } from "./eu-trend-card-view/eu-trend-card-view";
import { CountriesTrendCardView } from "./countries-trend-card-view/countries-trend-card-view";
import { CountriesSnapshotCardView } from "./countries-snapshot-card-view/countries-snapshot-card-view";
import { PolicyMapCardView } from "./policy-map-card-view/policy-map-card-view";
import { PolicyCountriesCardView } from "./policy-countries-card-view/policy-countries-card-view";
import { StackedColumnView } from "./stacked-column-view/stacked-column-view";
import { SelectorTrendCardView } from "./selector-trend-card-view/selector-trend-card-view";
import { SelectorDotPlotCardView } from "./selector-dot-plot-card-view/selector-dot-plot-card-view";

export type CardViewKind = 'eu-snapshot' | 'eu-trend' | 'countries-trend' | 'countries-snapshot' | 'policy-map'
  | 'policy-countries' | 'stacked-column' | 'access-type-trend' | 'access-type-dot-plot';

const RENDER_STYLE_TO_VIEW: Partial<Record<RenderStyle, CardViewKind>> = {
  SCALAR: 'eu-snapshot',
  LINE_CHART: 'eu-trend',
  PROGRESS_BARS: 'countries-snapshot',
  MULTI_SERIES_LINE_CHART: 'countries-trend',
  YES_NO: 'policy-countries',
  YES_NO_TIMELINE: 'policy-countries',
  MAP: 'policy-map',
  MAP_WITH_CHANGE_COUNT: 'policy-map',
  STACKED_COLUMN: 'stacked-column',
  PROGRESS_LINE_CHART: 'access-type-dot-plot',
};

/** Same lookup indicator-card uses to pick its child view — exported so the dashboard
 *  grid (custom-search.component.ts) can size a card's grid cell without duplicating
 *  the countryScope/timeScope → renderStyle → view matching logic. */
export function resolveCardViewKind(
  indicator: ExploreIndicatorConfig,
  geographyScope: 'all' | 'select',
  startYear: number,
  endYear: number
): CardViewKind | undefined {
  const countryScope: CountryScope = geographyScope === 'all' ? 'ALL_COUNTRIES' : 'SELECTED_COUNTRIES';
  const timeScope: TimeScope = startYear === endYear ? 'SINGLE_YEAR' : 'TIME_RANGE';

  const view = indicator.views.find(v => v.countryScope === countryScope && v.timeScope === timeScope);
  if (!view) {
    return undefined;
  }
  // Same renderStyle, two different views: a selector means "one line per category
  // (e.g. Access Type), user picks which" instead of "one line per selected country".
  if (view.renderStyle === 'MULTI_SERIES_LINE_CHART' && view.selector) {
    return 'access-type-trend';
  }
  return RENDER_STYLE_TO_VIEW[view.renderStyle];
}

@Component({
  selector: 'app-indicator-card',
  templateUrl: './indicator-card.html',
  imports: [
    EuSnapshotCardView,
    EuTrendCardView,
    CountriesTrendCardView,
    CountriesSnapshotCardView,
    PolicyMapCardView,
    PolicyCountriesCardView,
    StackedColumnView,
    SelectorTrendCardView,
    SelectorDotPlotCardView
  ]
})
export class IndicatorCard {
  indicator = input.required<ExploreIndicatorConfig>();
  geographyScope = input.required<'all' | 'select'>();
  startYear = input.required<number>();
  endYear = input.required<number>();
  selectedCountryIds = input.required<Set<string>>();

  readonly closeCard = output<string>();

  readonly cardViewKind = computed<CardViewKind | undefined>(() =>
    resolveCardViewKind(this.indicator(), this.geographyScope(), this.startYear(), this.endYear())
  );
}
