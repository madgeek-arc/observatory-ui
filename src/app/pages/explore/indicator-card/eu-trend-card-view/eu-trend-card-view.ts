import {Component, computed, inject, input} from "@angular/core";
import {HighchartsChartModule} from "highcharts-angular";
import * as Highcharts from "highcharts";
import {
  CustomSearchService,
  dataOf,
  hasNumericValue,
  IndicatorPresetQueryRequest
} from "../../custom-search/services/custom-search.service";
import {CardState} from "../../../../shared/card-state/card-state";
import {colors} from "../../../../domain/chart-color-palette";
import {IndicatorFormat} from "../../../../domain/explore-indicators";
import {formatIfNumber} from "../../../../domain/format-indicator-value";

@Component({
  selector: 'app-eu-trend-card-view',
  templateUrl: './eu-trend-card-view.html',
  imports: [HighchartsChartModule, CardState]
})
export class EuTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  format = input.required<IndicatorFormat>();

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

  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);

  private readonly response = computed(() => dataOf(this.state()));

  readonly trendChartOptions = computed<Highcharts.Options | undefined>(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }

    const sorted = [...response.data].sort((a, b) => a.dimensions['period'].localeCompare(b.dimensions['period']));
    const format = this.format();

    return {
      chart: {type: 'line', height: 200},
      title: {text: undefined},
      credits: {enabled: false},
      exporting: {enabled: false},
      xAxis: {
        categories: sorted.map(point => point.dimensions['period']),
        labels: {style: {color: '#a4adb2'}}
      },
      yAxis: {
        title: {text: undefined},
        labels: {style: {color: '#a4adb2'}},
      },
      tooltip: {pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.formattedValue}</b><br/>'},
      series: [{
        type: 'line',
        name: 'EU average',
        data: sorted.map(point => ({
          y: typeof point.value === 'number' ? point.value : null,
          formattedValue: formatIfNumber(point.value, format)
        }))
      }]
        .map((serie, index) =>
          ({...serie, type: 'line' as const, color: colors[index % colors.length]})),
      legend: {enabled: false},
    };
  });

  readonly summaryRow = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const format = this.format();
    return {
      euAverage: this.customSearchService.showEuAverage()
        ? formatIfNumber(response.summary.find(s => s.dimensions.aggregation === 'AVG')?.value, format)
        : undefined,
      median: this.customSearchService.showMedianValues()
        ? formatIfNumber(response.summary.find(s => s.dimensions.aggregation === 'MEDIAN')?.value, format)
        : undefined
    };
  });

  readonly isEmpty = computed(() => !hasNumericValue(this.response()));
}
