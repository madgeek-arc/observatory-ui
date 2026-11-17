import { Component, computed, inject, input } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import * as Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import { combineStates, CustomSearchService, dataOf, hasNumericValue, IndicatorPresetQueryRequest, IndicatorQueryResponse } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { formatCompactNumber, formatPercent, roundHalfUp } from "../../../../domain/format-indicator-value";
import { CardState } from "../../../../shared/card-state/card-state";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";

/** Height of one row and of the bar inside it — shared by the charts and the "No data" bar. */
const ROW_HEIGHT = 44;
const BAR_HEIGHT = 20;
const BAR_RADIUS = 8;

interface BarSegment {
  code: string;
  label: string;
  value: number;
  percent: number;
  color: string;
  formattedValue: string;
}

@Component({
  selector: 'app-multi-stacked-bars-card-view',
  templateUrl: './multi-stacked-bars-card-view.html',
  imports: [HighchartsChartModule, CardState]
})
export class MultiStackedBarsCardView {
  private readonly customSearchService = inject(CustomSearchService);
  private readonly stakeholdersService = inject(StakeholdersService);

  Highcharts: typeof Highcharts = Highcharts;

  readonly rowHeight = ROW_HEIGHT;
  readonly barHeight = BAR_HEIGHT;
  readonly barRadius = BAR_RADIUS;

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();

  readonly endYear = computed(() => this.customSearchService.endYear());

  /** Selected countries, one year — drives the per-country bars. */
  private readonly countriesQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.endYear(),
      yearTo: this.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  private readonly countriesState = this.customSearchService.queryIndicatorState(this.countriesQueryParams);
  private readonly countriesResponse = computed(() => dataOf(this.countriesState()));

  /** Same countries as the country picker — the "EU average" bar averages over them. */
  private readonly allCountryIds = toSignal(this.stakeholdersService.getEOSCSBCountries(), { initialValue: [] as string[] });

  /** Every country, one year — drives the muted "EU average" bar only. Per-country rows
   *  (not the ALL_COUNTRIES total) so each area can be averaged over the countries. */
  private readonly euQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.allCountryIds()],
      yearFrom: this.endYear(),
      yearTo: this.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  private readonly euState = this.customSearchService.queryIndicatorState(this.euQueryParams);
  private readonly euResponse = computed(() => dataOf(this.euState()));

  /** The card waits for both requests — see combineStates. */
  readonly state = computed(() => combineStates(this.countriesState(), this.euState()));

  /** No selector on this view (same as StackedBarWithProgressCardView) — the breakdown
   *  dimension is derived from whichever response resolves first. `country` is excluded
   *  too, since the countries response carries it alongside the real breakdown. */
  private readonly dimension = computed(() =>
    (this.countriesResponse() ?? this.euResponse())?.dimensions.find(d => d !== 'period' && d !== 'country') ?? ''
  );

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );

  /** One color per area, in legend order (areas with a value in the EU response), so the
   *  same area has the same color in every bar and in the legend. */
  private readonly colorByCode = computed(() => {
    const dimension = this.dimension();
    const codes = (this.euResponse()?.data ?? [])
      .filter(point => typeof point.value === 'number')
      .map(point => point.dimensions[dimension]);
    return new Map([...new Set(codes)].map((code, index) => [code, colors[index % colors.length]]));
  });
  private buildSegments(data: IndicatorQueryResponse['data']): { total: number; segments: BarSegment[] } {
    const dimension = this.dimension();
    const total = data.reduce((sum, point) => sum + (typeof point.value === 'number' ? point.value : 0), 0);
    if (total === 0) {
      return { total: 0, segments: [] };
    }
    const segments = data
      .filter(point => typeof point.value === 'number')
      .map((point, index) => {
        const value = point.value as number;
        const code = point.dimensions[dimension];
        return {
          code,
          label: this.labelByCode()[code] ?? code,
          value,
          percent: roundHalfUp((value / total) * 100),
          color: this.colorByCode().get(code) ?? colors[index % colors.length],
          formattedValue: formatCompactNumber(value)
        };
      });
    return { total, segments };
  }

  /** "EU average" bar: per area, the average over the countries that have a value
   *  (null = no data, not 0). */
  private buildAverageSegments(data: IndicatorQueryResponse['data']): { total: number; segments: BarSegment[] } {
    const dimension = this.dimension();
    const sumByCode = new Map<string, { sum: number; count: number }>();
    for (const point of data) {
      if (typeof point.value !== 'number') {
        continue;
      }
      const code = point.dimensions[dimension];
      const entry = sumByCode.get(code) ?? { sum: 0, count: 0 };
      sumByCode.set(code, { sum: entry.sum + point.value, count: entry.count + 1 });
    }
    const averages: IndicatorQueryResponse['data'] = [...sumByCode].map(([code, { sum, count }]) => ({
      dimensions: { [dimension]: code },
      value: sum / count
    }));
    return this.buildSegments(averages);
  }

  /** Same one-series-per-segment trick as StackedBarWithProgressCardView, just sized
   *  for a compact row instead of a single standalone bar. */
  private buildBarOptions(segments: BarSegment[]): Highcharts.Options | undefined {
    if (segments.length === 0) {
      return undefined;
    }
    return {
      chart: {
        type: 'bar',
        height: ROW_HEIGHT,
        spacing: [(ROW_HEIGHT - BAR_HEIGHT) / 2, 0, (ROW_HEIGHT - BAR_HEIGHT) / 2, 0]
      },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: [''], visible: false },
      yAxis: { min: 0, max: 100, visible: false, title: { text: undefined } },
      tooltip: { pointFormatter: function () { return `${this.series.name}: ${formatPercent(this.y ?? 0)}`; } },
      plotOptions: {
        bar: {
          stacking: 'normal',
          borderWidth: 0,
          pointWidth: BAR_HEIGHT,
          borderRadius: { radius: BAR_RADIUS, scope: 'stack', where: 'all' },
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            formatter: function (): string | null {
              return (this.y ?? 0) >= 10 ? formatPercent(this.y ?? 0) : null;
            }
          }
        }
      },
      legend: { enabled: false },
      series: segments.map(segment => ({
        type: 'bar' as const,
        name: segment.label,
        data: [segment.percent],
        color: segment.color
      }))
    };
  }

  /** One row per selected country, in the order they were selected. */
  readonly countryRows = computed(() => {
    const response = this.countriesResponse();
    if (!response) {
      return [];
    }
    const countries = resolveSelectedCountries(this.customSearchService.selectedCountryIds());

    const rows = countries.map(country => {
      const countryData = response.data.filter(point => point.dimensions['country'] === country.id);
      const { total, segments } = this.buildSegments(countryData);
      // Only nulls (e.g. Greece 2024) = no data, not 0.
      const hasValue = countryData.some(point => typeof point.value === 'number');
      return {
        name: country.name,
        formattedTotal: hasValue ? formatCompactNumber(total) : '',
        chartOptions: this.buildBarOptions(segments)
      };
    });

    return rows.map((row, index) => ({ ...row, rank: index + 1 }));
  });

  readonly euRow = computed(() => {
    const response = this.euResponse();
    if (!response || this.allCountryIds().length === 0) {
      return undefined;
    }
    const { segments } = this.buildAverageSegments(response.data);
    return {
      chartOptions: this.buildBarOptions(segments)
    };
  });

  readonly legendItems = computed(() => this.buildAverageSegments(this.euResponse()?.data ?? []).segments);

  readonly isEmpty = computed(() => !hasNumericValue(this.countriesResponse()));
}
