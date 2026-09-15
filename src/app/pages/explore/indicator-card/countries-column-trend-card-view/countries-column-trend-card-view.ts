import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-countries-column-trend-card-view',
  templateUrl: './countries-column-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class CountriesColumnTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;

  /** Selected countries, each given a stable color (by position) shared between
   *  the chart series and the legend below it. */
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

  private readonly years = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(point => point.dimensions['period']))].sort() : undefined;
  });

  /** value(country, year) via one O(1)-lookup map, built once per response instead
   *  of re-scanning response.data for every lookup. */
  private readonly valueByKey = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const map = new Map<string, number>();
    for (const point of response.data) {
      if (typeof point.value === 'number') {
        map.set(`${point.dimensions['country']}|${point.dimensions['period']}`, point.value);
      }
    }
    return map;
  });

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const years = this.years();
    const valueByKey = this.valueByKey();
    const countries = this.selectedCountries();
    if (!years || !valueByKey) {
      return undefined;
    }

    return {
      chart: { type: 'column', height: 200 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: years },
      yAxis: { min: 0, title: { text: undefined } },
      tooltip: { pointFormat: '{series.name}: {point.y}' },
      plotOptions: { column: { dataLabels: { enabled: true } } },
      legend: { enabled: false },
      series: countries.map(country => ({
        type: 'column' as const,
        name: country.name,
        color: country.color,
        data: years.map(year => valueByKey.get(`${country.id}|${year}`) ?? 0)
      }))
    };
  });
}
