import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-countries-trend-card-view',
  templateUrl: './countries-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class CountriesTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;

  readonly selectedCountries = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds())
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

    const series = this.selectedCountries().map(country => {
      const valueByYear = new Map(
        response.data
          .filter(point => point.dimensions['country'] === country.id)
          .map(point => [point.dimensions['period'], typeof point.value === 'number' ? point.value : null])
      );
      return {
        type: 'line' as const,
        name: country.name,
        data: years.map(year => valueByYear.get(year) ?? null)
      };
    });

    return {
      chart: { type: 'line', height: 200 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      plotOptions: { line: { marker: { enabled: false } } },
      xAxis: { categories: years },
      yAxis: { title: { text: undefined } },
      series
    };
  });
}
