import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-stacked-column-view',
  templateUrl: './stacked-column-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class StackedColumnView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;
  readonly colors = colors;

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);

  private readonly accessTypeCodes = computed(() => this.members()?.map(m => m.code) ?? []);
  private readonly accessTypeLabels = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );
  /** Labels only, for the legend in the template — it just prints these against colors[i]. */
  readonly accessTypes = computed(() => this.members()?.map(m => m.label) ?? []);

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

  /** Document types actually present in the response, alphabetical — not from /members,
   *  since /members returns the whole universal vocabulary for this indicatorCode, not
   *  just the classifications this indicator's data actually uses. */
  private readonly classifications = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(p => p.dimensions['classification']))].sort() : [];
  });

  /** One chart, one category per document type — each category is its own stacked column. */
  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const response = this.response();
    const accessTypeCodes = this.accessTypeCodes();
    const accessTypeLabels = this.accessTypeLabels();
    const classifications = this.classifications();
    if (!response || accessTypeCodes.length === 0) {
      return undefined;
    }
    const dimension = this.dimension();

    const valueOf = (accessType: string, classification: string) =>
      response.data.find(point =>
        point.dimensions[dimension] === accessType && point.dimensions['classification'] === classification
      )?.value ?? 0;

    return {
      chart: { type: 'column', height: 240 },
      colors,
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        categories: classifications,
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
      series: accessTypeCodes.map(accessType => ({
        type: 'column' as const,
        name: accessTypeLabels[accessType],
        data: classifications.map(classification => valueOf(accessType, classification))
      }))
    };
  });
}
