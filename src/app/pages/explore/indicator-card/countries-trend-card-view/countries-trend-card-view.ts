import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";
import { IndicatorFormat } from "../../../../domain/explore-indicators";
import { formatIfNumber, formatIndicatorValue } from "../../../../domain/format-indicator-value";

export type TrendMode = 'per-year' | 'cumulative';

/** Running total — nothing before the first reported year; after it, a null year adds 0. */
function toCumulative(values: (number | null)[]): (number | null)[] {
  let running: number | null = null;
  return values.map(value => {
    if (value !== null) {
      running = (running ?? 0) + value;
    }
    return running;
  });
}

@Component({
  selector: 'app-countries-trend-card-view',
  templateUrl: './countries-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class CountriesTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  /** 'cumulative' turns each country's line into a running total from the range's first year. */
  mode = input<TrendMode>('per-year');
  format = input.required<IndicatorFormat>();

  Highcharts: typeof Highcharts = Highcharts;

  /** Selected countries, each given a stable color (by position) — same
   *  colors[index % colors.length] convention every other country-series chart uses. */
  readonly selectedCountries = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds()).map((country, index) => ({
      ...country,
      color: colors[index % colors.length]
    }))
  );

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  readonly trendChartOptions = computed<Highcharts.Options | undefined>(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }

    const years = [...new Set(response.data.map(point => point.dimensions['period']))].sort();
    const format = this.format();

    const series = this.selectedCountries().map(country => {
      const valueByYear = new Map(
        response.data
          .filter(point => point.dimensions['country'] === country.id)
          .map(point => [point.dimensions['period'], typeof point.value === 'number' ? point.value : null])
      );
      const values = years.map(year => valueByYear.get(year) ?? null);
      const finalValues = this.mode() === 'cumulative' ? toCumulative(values) : values;
      return {
        type: 'line' as const,
        name: country.name,
        color: country.color,
        data: finalValues.map(value => ({ y: value, formattedValue: formatIfNumber(value ?? undefined, format) }))
      };
    });

    return {
      chart: { type: 'line', height: 200 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      plotOptions: { line: { marker: { enabled: false } } },
      xAxis: { categories: years },
      yAxis: {
        title: { text: undefined },
        labels: {
          formatter: function (): string {
            return formatIndicatorValue(Number(this.value), format);
          }
        }
      },
      tooltip: { pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.formattedValue}</b><br/>' },
      series
    };
  });
}
