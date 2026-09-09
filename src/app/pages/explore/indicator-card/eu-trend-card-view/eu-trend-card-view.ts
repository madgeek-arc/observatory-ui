import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-eu-trend-card-view',
  templateUrl: './eu-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class EuTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: [
        ...(this.customSearchService.showEuAverage() ? ['AVG'] : []),
        ...(this.customSearchService.showMedianValues() ? ['MEDIAN'] : [])
      ]
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  readonly trendChartOptions = computed<Highcharts.Options | undefined>(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }

    const sorted = [...response.data].sort((a, b) => a.dimensions['period'].localeCompare(b.dimensions['period']));

    return {
      chart: { type: 'line', height: 200 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: sorted.map(point => point.dimensions['period']) },
      yAxis: { title: { text: undefined } },
      series: [{ type: 'line', name: 'EU average', data: sorted.map(point => point.value) }]
    };
  });

  readonly summaryRow = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    return {
      euAverage: this.customSearchService.showEuAverage()
        ? response.summary.find(s => s.dimensions.aggregation === 'AVG')?.value
        : undefined,
      median: this.customSearchService.showMedianValues()
        ? response.summary.find(s => s.dimensions.aggregation === 'MEDIAN')?.value
        : undefined
    };
  });
}
