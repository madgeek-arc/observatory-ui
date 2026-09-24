import { Component, computed, inject, input, output, signal } from "@angular/core";
import { CountryScope, ExploreIndicatorConfig, IndicatorRenderStyle, IndicatorView, RenderStyle, TimeScope } from "../../../domain/explore-indicators";
import { CustomSearchService } from "../custom-search/services/custom-search.service";
import { EuSnapshotCardView } from "./eu-snapshot-card-view/eu-snapshot-card-view";
import { EuTrendCardView } from "./eu-trend-card-view/eu-trend-card-view";
import { CountriesTrendCardView } from "./countries-trend-card-view/countries-trend-card-view";
import { CountriesSnapshotCardView } from "./countries-snapshot-card-view/countries-snapshot-card-view";
import { PolicyMapCardView } from "./policy-map-card-view/policy-map-card-view";
import { PolicyCountriesCardView } from "./policy-countries-card-view/policy-countries-card-view";
import { StackedColumnView } from "./stacked-column-view/stacked-column-view";
import { SelectorTrendCardView } from "./selector-trend-card-view/selector-trend-card-view";
import { SelectorDotPlotCardView } from "./selector-dot-plot-card-view/selector-dot-plot-card-view";
import { SelectorCountriesTrendCardView } from "./selector-countries-trend-card-view/selector-countries-trend-card-view";
import { ChoroplethTopCountriesCardView } from "./choropleth-top-countries-card-view/choropleth-top-countries-card-view";
import { EuColumnTrendCardView } from "./eu-column-trend-card-view/eu-column-trend-card-view";
import { CountriesColumnTrendCardView } from "./countries-column-trend-card-view/countries-column-trend-card-view";
import { SelectorBarChartCardView } from "./selector-bar-chart-card-view/selector-bar-chart-card-view";
import { SelectorYesNoTableCardView } from "./selector-yes-no-table-card-view/selector-yes-no-table-card-view";
import { StackedBarWithProgressCardView } from "./stacked-bar-with-progress-card-view/stacked-bar-with-progress-card-view";
import { StackedColumnWithTotalsCardView } from "./stacked-column-with-totals-card-view/stacked-column-with-totals-card-view";
import { YearAdoptedTableCardView } from "./year-adopted-table-card-view/year-adopted-table-card-view";
import { CoverageTrendCardView } from "./coverage-trend-card-view/coverage-trend-card-view";

export type CardViewKind = 'eu-snapshot' | 'eu-trend' | 'countries-trend' | 'countries-snapshot' | 'policy-map'
  | 'policy-countries' | 'stacked-column' | 'access-type-trend' | 'access-type-dot-plot' | 'access-type-countries-trend'
  | 'choropleth-top-countries' | 'eu-column-trend' | 'countries-column-trend' | 'selector-bar-chart'
  | 'selector-yes-no-table' | 'stacked-bar-with-progress' | 'stacked-column-with-totals' | 'year-adopted-table'
  | 'coverage-trend';

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
  MULTI_LINE_CHARTS: 'access-type-countries-trend',
  CHOROPLETH_MAP_WITH_TOP_5: 'choropleth-top-countries',
  COLUMN_CHART: 'eu-column-trend',
  MULTI_SERIES_COLUMN_CHART: 'countries-column-trend',
  BAR_CHART: 'selector-bar-chart',
  MULTI_SERIES_BAR_CHART: 'selector-bar-chart',
  YES_NO_TABLE: 'selector-yes-no-table',
  STACKED_BAR_WITH_PROGRESS: 'stacked-bar-with-progress',
  COLUMN_CHART_WITH_VALUE_LABELS: 'stacked-column-with-totals',
  YEAR_ADOPTED_TABLE: 'year-adopted-table',
  COVERAGE_TREND: 'coverage-trend',
};

/** Finds the one view matching the current countryScope/timeScope — shared by
 *  resolveCardViewKind() below and by IndicatorCard's own currentView(), which also
 *  needs the view's selector (dimension name), not just its renderStyle. */
export function resolveCurrentView(
  indicator: ExploreIndicatorConfig,
  geographyScope: 'all' | 'select',
  startYear: number,
  endYear: number
): IndicatorView | undefined {
  const countryScope: CountryScope = geographyScope === 'all' ? 'ALL_COUNTRIES' : 'SELECTED_COUNTRIES';
  const timeScope: TimeScope = startYear === endYear ? 'SINGLE_YEAR' : 'TIME_RANGE';

  return indicator.views.find(v => v.countryScope === countryScope && v.timeScope === timeScope);
}

/** Maps an already-resolved view plus a chosen renderStyle (one of that view's
 *  renderStyles entries) to the child view component to render. Kept separate from
 *  resolveCurrentView() because a view can now offer more than one renderStyle — which
 *  one is "chosen" is per-card UI state (IndicatorCard.effectiveRenderStyle), not
 *  something derivable from the view alone. */
export function resolveCardViewKind(
  view: IndicatorView | undefined,
  renderStyle: RenderStyle | undefined
): CardViewKind | undefined {
  if (!view || !renderStyle) {
    return undefined;
  }
  // Same renderStyle, two different views: a selector means "one line per category
  // (e.g. Access Type), user picks which" instead of "one line per selected country".
  if (renderStyle === 'MULTI_SERIES_LINE_CHART' && view.selector) {
    return 'access-type-trend';
  }
  return RENDER_STYLE_TO_VIEW[renderStyle];
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
    SelectorDotPlotCardView,
    SelectorCountriesTrendCardView,
    ChoroplethTopCountriesCardView,
    EuColumnTrendCardView,
    CountriesColumnTrendCardView,
    SelectorBarChartCardView,
    SelectorYesNoTableCardView,
    StackedBarWithProgressCardView,
    StackedColumnWithTotalsCardView,
    YearAdoptedTableCardView,
    CoverageTrendCardView
  ]
})
export class IndicatorCard {
  private readonly customSearchService = inject(CustomSearchService);

  indicator = input.required<ExploreIndicatorConfig>();

  readonly closeCard = output<string>();

  readonly currentView = computed<IndicatorView | undefined>(() =>
    resolveCurrentView(
      this.indicator(),
      this.customSearchService.geographyScope(),
      this.customSearchService.startYear(),
      this.customSearchService.endYear()
    )
  );

  readonly renderStyles = computed<IndicatorRenderStyle[]>(() => this.currentView()?.renderStyles ?? []);

  /** undefined, or a style that no longer belongs to the current view (e.g. after a
   *  scope/year change resolves a different view) = "fall back to the first entry",
   *  without needing an effect() to reset it. */
  readonly selectedRenderStyle = signal<RenderStyle | undefined>(undefined);
  readonly effectiveRenderStyle = computed<RenderStyle | undefined>(() => {
    const styles = this.renderStyles();
    const selected = this.selectedRenderStyle();
    return styles.some(s => s.style === selected) ? selected : styles[0]?.style;
  });

  readonly cardViewKind = computed<CardViewKind | undefined>(() =>
    resolveCardViewKind(this.currentView(), this.effectiveRenderStyle())
  );

  readonly needsCountrySelection = computed(() =>
    this.customSearchService.geographyScope() === 'select' &&
    this.customSearchService.selectedCountryIds().size === 0
  );

  selectRenderStyle(style: RenderStyle) {
    this.selectedRenderStyle.set(style);
  }
}
