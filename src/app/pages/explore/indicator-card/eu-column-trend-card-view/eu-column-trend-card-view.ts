import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-eu-column-trend-card-view',
  templateUrl: './eu-column-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class EuColumnTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  /** One total per year, summed across every country — the response gives us
   *  per-country per-year points, not a pre-aggregated EU total. */
  private readonly yearlyTotals = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const sums = new Map<string, number>();
    for (const point of response.data) {
      if (typeof point.value !== 'number') {
        continue;
      }
      const year = point.dimensions['period'];
      sums.set(year, (sums.get(year) ?? 0) + point.value);
    }
    return [...sums.entries()].sort(([a], [b]) => a.localeCompare(b));
  });

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const totals = this.yearlyTotals();
    if (!totals) {
      return undefined;
    }
    return {
      chart: { type: 'column', height: 200 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: totals.map(([year]) => year) },
      yAxis: { min: 0, title: { text: undefined } },
      tooltip: { pointFormat: '{point.y}' },
      plotOptions: {
        column: {
          color: colors[0],
          dataLabels: { enabled: true }
        }
      },
      legend: { enabled: false },
      series: [{ type: 'column', name: 'Total', data: totals.map(([, value]) => value) }]
    };
  });
}
