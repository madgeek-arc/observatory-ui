import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { ACCESS_TYPE_LABELS, ACCESS_TYPES, CLASSIFICATION_LABELS, CLASSIFICATIONS } from "../../../../domain/oa-license-status";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-stacked-column-view',
  templateUrl: './stacked-column-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class StackedColumnView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;
  readonly accessTypes = ACCESS_TYPES.map(type => ACCESS_TYPE_LABELS[type]);
  readonly colors = colors;

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.startYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  /** One chart, one category per document type — each category is its own stacked column. */
  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }

    const valueOf = (accessType: string, classification: string) =>
      response.data.find(point =>
        point.dimensions['oaLicenseStatus'] === accessType && point.dimensions['classification'] === classification
      )?.value ?? 0;

    return {
      chart: { type: 'column', height: 240 },
      colors,
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        categories: CLASSIFICATIONS.map(c => CLASSIFICATION_LABELS[c]),
        reversedStacks: true,
        lineWidth: 0,
        tickLength: 0,
        labels: { rotation: 0, style: { fontSize: '11px' } }
      },
      yAxis: {
        min: 0,
        max: 100,
        title: { text: undefined },
        gridLineWidth: 1
      },
      tooltip: {
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.total}'
      },
      plotOptions: {
        column: {
          stacking: 'percent',
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            formatter: function (): string | null {
              return (this.point.percentage ?? 0) >= 5 ? `${Math.round(this.point.percentage ?? 0)}%` : null;
            }
          }
        }
      },
      legend: { enabled: false },
      series: ACCESS_TYPES.map(accessType => ({
        type: 'column' as const,
        name: ACCESS_TYPE_LABELS[accessType],
        data: CLASSIFICATIONS.map(classification => valueOf(accessType, classification))
      }))
    };
  });
}
