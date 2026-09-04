import { Component, computed, inject, input } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs/operators";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { countries } from "../../../../domain/countries";

@Component({
  selector: 'app-countries-trend-card-view',
  templateUrl: './countries-trend-card-view.html',
  imports: [HighchartsChartModule]
})
export class CountriesTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  startYear = input.required<number>();
  endYear = input.required<number>();
  selectedCountryIds = input.required<Set<string>>();

  Highcharts: typeof Highcharts = Highcharts;

  readonly selectedCountries = computed(() =>
    [...this.selectedCountryIds()]
      .map(id => countries.find(c => c.id === id))
      .filter((c): c is { id: string; name: string } => !!c)
  );

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.selectedCountryIds()],
      yearFrom: this.startYear(),
      yearTo: this.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = toSignal(
    toObservable(this.queryParams).pipe(
      switchMap(({ id, request }) => this.customSearchService.queryIndicator(id, request))
    )
  );

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
          .map(point => [point.dimensions['period'], point.value])
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
