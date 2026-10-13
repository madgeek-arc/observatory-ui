import { Component, computed, inject, input } from "@angular/core";
import * as Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import { combineStates, CustomSearchService, dataOf, hasNumericValue, IndicatorPresetQueryRequest, IndicatorQueryResponse } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { formatCount } from "../../../../domain/format-indicator-value";
import { CardState } from "../../../../shared/card-state/card-state";

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

  Highcharts: typeof Highcharts = Highcharts;

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

  /** ALL_COUNTRIES, one year — drives the muted "EU average" bar only. */
  private readonly euQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
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
          percent: Math.round((value / total) * 100),
          color: colors[index % colors.length],
          formattedValue: formatCount(value)
        };
      });
    return { total, segments };
  }

  /** Same one-series-per-segment trick as StackedBarWithProgressCardView, just sized
   *  for a compact row instead of a single standalone bar. */
  private buildBarOptions(segments: BarSegment[]): Highcharts.Options | undefined {
    if (segments.length === 0) {
      return undefined;
    }
    return {
      chart: { type: 'bar', height: 44 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: [''], visible: false },
      yAxis: { min: 0, max: 100, visible: false, title: { text: undefined } },
      tooltip: { pointFormat: '{series.name}: {point.y}%' },
      plotOptions: {
        bar: {
          stacking: 'normal',
          borderWidth: 0,
          pointWidth: 32,
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            formatter: function (): string | null {
              return (this.y ?? 0) >= 10 ? `${this.y}%` : null;
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

  /** One row per selected country, ranked descending by open-access share (the first
   *  segment's percent) — matches the mockup's "ranked by open access share" caption. */
  readonly countryRows = computed(() => {
    const response = this.countriesResponse();
    if (!response) {
      return [];
    }
    const countries = resolveSelectedCountries(this.customSearchService.selectedCountryIds());

    const rows = countries.map(country => {
      const countryData = response.data.filter(point => point.dimensions['country'] === country.id);
      const { total, segments } = this.buildSegments(countryData);
      return {
        name: country.name,
        formattedTotal: formatCount(total),
        headlinePercent: segments[0]?.percent ?? 0,
        chartOptions: this.buildBarOptions(segments)
      };
    });

    return rows
      .sort((a, b) => b.headlinePercent - a.headlinePercent)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  });

  readonly euRow = computed(() => {
    const response = this.euResponse();
    if (!response) {
      return undefined;
    }
    const { segments } = this.buildSegments(response.data);
    return {
      headlinePercent: segments[0]?.percent ?? 0,
      chartOptions: this.buildBarOptions(segments)
    };
  });

  readonly legendItems = computed(() => this.buildSegments(this.euResponse()?.data ?? []).segments);

  readonly isEmpty = computed(() => !hasNumericValue(this.countriesResponse()));
}
