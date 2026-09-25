import { Component, computed, inject, input } from "@angular/core";
import * as Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-selector-share-trend-card-view',
  templateUrl: './selector-share-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class SelectorShareTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  dimension = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;

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

  private readonly years = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(point => point.dimensions['period']))].sort() : [];
  });

  /** One pass over the response builds "country|period" -> OA share%. Same simplification
   *  as StackedColumnWithTotalsCardView's headline — hardcoded to "OA", not generalized to
   *  an arbitrary category, since that's the only share this view is asked to show. */
  private readonly sharePercentByKey = computed(() => {
    const response = this.response();
    const dimension = this.dimension();
    const totals = new Map<string, number>();
    const oaValues = new Map<string, number>();
    if (!response) {
      return new Map<string, number>();
    }
    for (const point of response.data) {
      if (typeof point.value !== 'number') {
        continue;
      }
      const key = `${point.dimensions['country']}|${point.dimensions['period']}`;
      totals.set(key, (totals.get(key) ?? 0) + point.value);
      if (point.dimensions[dimension] === 'OA') {
        oaValues.set(key, point.value);
      }
    }
    const percentByKey = new Map<string, number>();
    for (const [key, total] of totals) {
      percentByKey.set(key, total > 0 ? Math.round((oaValues.get(key) ?? 0) / total * 100) : 0);
    }
    return percentByKey;
  });

  /** Selected countries, each given a stable color (by position) — same colors[index %
   *  colors.length] convention CountriesTrendCardView uses for its per-country lines. */
  readonly countryShares = computed(() => {
    const percentByKey = this.sharePercentByKey();
    const years = this.years();
    const latestYear = years[years.length - 1];

    return resolveSelectedCountries(this.customSearchService.selectedCountryIds()).map((country, index) => ({
      id: country.id,
      name: country.name,
      color: colors[index % colors.length],
      latestPercent: percentByKey.get(`${country.id}|${latestYear}`) ?? 0
    }));
  });

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const response = this.response();
    const years = this.years();
    if (!response) {
      return undefined;
    }
    const percentByKey = this.sharePercentByKey();

    return {
      chart: { type: 'line', height: 260 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: years },
      yAxis: { title: { text: undefined } },
      tooltip: { pointFormat: '{series.name}: {point.y}%' },
      plotOptions: { line: { marker: { enabled: false, radius: 4, symbol: 'circle' } } },
      legend: { enabled: false },
      series: this.countryShares().map(country => {
        const values = years.map(year => percentByKey.get(`${country.id}|${year}`) ?? 0);
        return {
          type: 'line' as const,
          name: country.name,
          color: country.color,
          // Every point is a plain number (inherits the series' marker:disabled) except
          // the last, which overrides just its own marker — so only the endpoint gets a dot.
          data: values.map((value, index) =>
            index === values.length - 1 ? { y: value, marker: { enabled: true } } : value
          )
        };
      })
    };
  });
}
