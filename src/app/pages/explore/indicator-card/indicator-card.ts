import { Component, computed, inject, input, output, Signal, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { CountryScope, ExploreIndicatorConfig, IndicatorFormat, IndicatorRenderStyle, IndicatorView, RenderStyle, TimeScope } from "../../../domain/explore-indicators";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../custom-search/services/custom-search.service";
import { formatIfNumber } from "../../../domain/format-indicator-value";
import { EuSnapshotCardView } from "./eu-snapshot-card-view/eu-snapshot-card-view";
import { EuTrendCardView } from "./eu-trend-card-view/eu-trend-card-view";
import { CountriesTrendCardView, TrendMode } from "./countries-trend-card-view/countries-trend-card-view";
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
import { MultiStackedBarsCardView } from "./multi-stacked-bars-card-view/multi-stacked-bars-card-view";
import { CompositeColumnsLineCardView } from "./composite-columns-line-card-view/composite-columns-line-card-view";
import { SelectorShareTrendCardView } from "./selector-share-trend-card-view/selector-share-trend-card-view";
import { PieWithProgressCardView} from "./pie-with-progress-card-view/pie-with-progress-card-view";
import { ProgressBarsNumPercentageCardView} from "./progress-bars-num-percentage-card-view/progress-bars-num-percentage-card-view";
import { EuAverageColumnTrendCardView } from "./eu-average-column-trend-card-view/eu-average-column-trend-card-view";
import { StackedColumnAmountShareCardView, StackedMode } from "./stacked-column-amount-share-card-view/stacked-column-amount-share-card-view";
import { TabbedCountriesTrendCardView } from "./tabbed-countries-trend-card-view/tabbed-countries-trend-card-view";
import {
  CountByAreaWithAverageCardView
} from "./count-by-area-with-average-card-view/count-by-area-with-average-card-view";

export type CardViewKind = 'eu-snapshot' | 'eu-trend' | 'countries-trend' | 'countries-snapshot' | 'policy-map'
  | 'policy-countries' | 'stacked-column' | 'access-type-trend' | 'access-type-dot-plot' | 'access-type-countries-trend'
  | 'choropleth-top-countries' | 'eu-column-trend' | 'countries-column-trend' | 'selector-bar-chart'
  | 'selector-yes-no-table' | 'stacked-bar-with-progress' | 'stacked-column-with-totals' | 'year-adopted-table'
  | 'coverage-trend' | 'multi-stacked-bars'  | 'composite-column' | 'composite-columns-line' | 'selector-share-trend'
  | 'pie-with-progress' | 'progress-bars-num-percentage' | 'eu-average-column-trend' | 'stacked-column-amount-share'
  | 'tabbed-countries-trend' | 'count-by-area-with-average';

const RENDER_STYLE_TO_VIEW: Record<RenderStyle, CardViewKind> = {
  SCALAR: 'eu-snapshot',
  LINE_CHART: 'eu-trend',
  PROGRESS_BARS: 'countries-snapshot',
  MULTI_SERIES_LINE_CHART: 'countries-trend',
  YES_NO: 'policy-countries',
  YES_NO_TIMELINE: 'policy-countries',
  MAP: 'policy-map',
  MAP_WITH_CHANGE_COUNT: 'policy-map',
  PROGRESS_LINE_CHART: 'access-type-dot-plot',
  MULTI_LINE_CHARTS: 'access-type-countries-trend',
  CHOROPLETH_MAP_WITH_TOP_5: 'choropleth-top-countries',
  COLUMN_CHART: 'eu-column-trend',
  MULTI_SERIES_COLUMN_CHART: 'countries-column-trend',
  BAR_CHART: 'selector-bar-chart',
  MULTI_SERIES_BAR_CHART: 'selector-bar-chart',
  YES_NO_TABLE: 'selector-yes-no-table',
  LATEST_YEAR_YES_NO_TABLE: 'selector-yes-no-table',
  STACKED_BAR_CHART_WITH_PROGRESS_BARS: 'stacked-bar-with-progress',
  COLUMN_CHART_WITH_VALUE_LABELS: 'stacked-column-with-totals',
  YEAR_ADOPTED_TABLE: 'year-adopted-table',
  COVERAGE_TREND: 'coverage-trend',
  MULTI_STACKED_BAR_CHARTS: 'multi-stacked-bars',
  SHARE_MULTI_STACKED_COLUMN_CHARTS: 'composite-columns-line',
  PIE_CHART_WITH_PROGRESS_BARS: 'pie-with-progress',
  PROGRESS_BARS_NUM_PERCENTAGE: 'progress-bars-num-percentage',
  CUMULATIVE_MULTI_SERIES_LINE_CHART: 'countries-trend',
  STACKED_COLUMN_CHART: 'stacked-column-amount-share',
  SHARE_STACKED_COLUMN_CHART: 'stacked-column-amount-share',
  TABBED_MULTI_SERIES_LINE_CHARTS: 'tabbed-countries-trend',
  COUNT_BY_AREA_WITH_AVERAGE: 'count-by-area-with-average'
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
  // SELECTED_COUNTRIES is a further split: that ALL_COUNTRIES case ignores country
  // scope entirely (queries countries: [] regardless), so it can't serve a view whose
  // whole point is "one line per selected country" — that gets its own component.
  if (renderStyle === 'MULTI_SERIES_LINE_CHART' && view.selector) {
    return view.countryScope === 'SELECTED_COUNTRIES' ? 'selector-share-trend' : 'access-type-trend';
  }
  // Same style, two views: a selector means "stacked by category" (ost-3, ost-4),
  // no selector means one value per country, shown as the EU average per year (nm-2, osp-3).
  if (renderStyle === 'COLUMN_CHART_WITH_VALUE_LABELS' && !view.selector) {
    return 'eu-average-column-trend';
  }
  // Same style, two views: with a single year it is the document-type distribution (oa-9, od-8:
  // one 100% column per document type, stacked by access type); over a range it is the Share
  // half of inv-2's Amount / Share toggle.
  if (renderStyle === 'SHARE_STACKED_COLUMN_CHART' && view.timeScope === 'SINGLE_YEAR') {
    return 'stacked-column';
  }
  return RENDER_STYLE_TO_VIEW[renderStyle];
}

/** Middle value of the sorted list; with an even count, the average of the two middle ones. */
function medianOf(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function averageOf(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
    CoverageTrendCardView,
    MultiStackedBarsCardView,
    CompositeColumnsLineCardView,
    SelectorShareTrendCardView,
    PieWithProgressCardView,
    ProgressBarsNumPercentageCardView,
    EuAverageColumnTrendCardView,
    StackedColumnAmountShareCardView,
    TabbedCountriesTrendCardView,
    CountByAreaWithAverageCardView
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

  /** The format of the cell being rendered — the backend sets it per view, not per preset. */
  readonly format = computed<IndicatorFormat>(() => this.currentView()?.format ?? this.indicator().format);

  readonly aggregations = computed<string[]>(() => {
    const allowed = this.currentView()?.allowedSeriesAggregations ?? [];
    return [
      ...(this.customSearchService.showEuAverage() ? ['AVG'] : []),
      ...(this.customSearchService.showMedianValues() ? ['MEDIAN'] : [])
    ].filter(aggregation => allowed.includes(aggregation));
  });

  /** EU average: always all EU countries, a fixed reference. */
  private readonly averageParams = computed(() => ({
    id: this.indicator().id,
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: this.aggregations().filter(aggregation => aggregation === 'AVG')
    } as IndicatorPresetQueryRequest
  }));

  /** Median: follows Geography. "All EU" gives the EU median, "Select" gives the median of the picked countries. */
  private readonly medianParams = computed(() => ({
    id: this.indicator().id,
    request: {
      countries: this.customSearchService.geographyScope() === 'all'
        ? []
        : [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: this.aggregations().filter(aggregation => aggregation === 'MEDIAN')
    } as IndicatorPresetQueryRequest
  }));

  private readonly averageSummary = this.summaryFor(this.averageParams);
  private readonly medianSummary = this.summaryFor(this.medianParams);

  /** The backend's summary for one request, or undefined when its aggregation is off or the call failed.
   *  switchMap drops an older in-flight call when the params change, so a slow old answer can't win. */
  private summaryFor(params: Signal<{ id: string; request: IndicatorPresetQueryRequest }>) {
    return toSignal(
      toObservable(params).pipe(
        switchMap(({ id, request }) =>
          request.seriesAggregations.length === 0
            ? of(undefined)
            : this.customSearchService.queryIndicator(id, request).pipe(
                map(response => response.summary),
                catchError(() => of(undefined))
              )
        )
      )
    );
  }

  /** Formatted EU average / median for the row under the card — undefined values are not shown. */
  readonly summaryRow = computed(() => {
    const averageSummary = this.averageSummary();
    const medianSummary = this.medianSummary();
    if (!averageSummary && !medianSummary) {
      return undefined;
    }
    const aggregations = this.aggregations();
    const format = this.format();
    return {
      euAverage: aggregations.includes('AVG')
        ? formatIfNumber(
            averageOf(
              (averageSummary ?? [])
                .filter(s => s.dimensions.aggregation === 'AVG')
                .map(s => s.value)
                .filter((value): value is number => typeof value === 'number')
            ),
            format
          )
        : undefined,
      median: aggregations.includes('MEDIAN')
        ? formatIfNumber(
            medianOf(
              (medianSummary ?? [])
                .filter(s => s.dimensions.aggregation === 'MEDIAN')
                .map(s => s.value)
                .filter((value): value is number => typeof value === 'number')
            ),
            format
          )
        : undefined,
      medianLabel: this.customSearchService.geographyScope() === 'all' ? 'EU median' : 'Median (selected countries)'
    };
  });


  readonly renderStyles = computed<IndicatorRenderStyle[]>(() => {
    const endYear = this.customSearchService.endYear();
    return (this.currentView()?.renderStyles ?? []).map(rs => {
      switch (rs.style) {
        case 'LATEST_YEAR_YES_NO_TABLE': return { ...rs, label: `Status in ${endYear}` };
        case 'STACKED_COLUMN_CHART': return { ...rs, label: `${rs.label} (€)` };
        case 'SHARE_STACKED_COLUMN_CHART': return { ...rs, label: `${rs.label} (%)` };
        default: return rs;
      }
    });
  });


  readonly selectedRenderStyle = signal<RenderStyle | undefined>(undefined);
  readonly effectiveRenderStyle = computed<RenderStyle | undefined>(() => {
    const styles = this.renderStyles();
    const selected = this.selectedRenderStyle();
    return styles.some(s => s.style === selected) ? selected : styles[0]?.style;
  });


  readonly trendMode = computed<TrendMode>(() =>
    this.effectiveRenderStyle() === 'CUMULATIVE_MULTI_SERIES_LINE_CHART' ? 'cumulative' : 'per-year'
  );

  readonly stackedMode = computed<StackedMode>(() =>
    this.effectiveRenderStyle() === 'SHARE_STACKED_COLUMN_CHART' ? 'share' : 'amount'
  );

  readonly cardViewKind = computed<CardViewKind | undefined>(() =>
    resolveCardViewKind(this.currentView(), this.effectiveRenderStyle())
  );

  readonly showChangeCount = computed(() =>
    this.effectiveRenderStyle() === 'MAP_WITH_CHANGE_COUNT'
  );

  readonly needsCountrySelection = computed(() =>
    this.customSearchService.geographyScope() === 'select' &&
    this.customSearchService.selectedCountryIds().size === 0
  );

  selectRenderStyle(style: RenderStyle) {
    this.selectedRenderStyle.set(style);
  }
}
