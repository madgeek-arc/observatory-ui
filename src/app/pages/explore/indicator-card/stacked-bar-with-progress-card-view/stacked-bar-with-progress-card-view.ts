import { Component, computed, inject, input } from "@angular/core";
import * as Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { colors } from "../../../../domain/chart-color-palette";
import { formatCount } from "../../../../domain/format-indicator-value";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-stacked-bar-with-progress-card-view',
  templateUrl: './stacked-bar-with-progress-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class StackedBarWithProgressCardView {
  private readonly customSearchService = inject(CustomSearchService);

  Highcharts: typeof Highcharts = Highcharts;

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();

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

  private readonly dimension = computed(() => this.response()?.dimensions.find(d => d !== 'period') ?? '');

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );

  readonly total = computed(() => {
    const response = this.response();
    if (!response) {
      return 0;
    }
    return response.data.reduce((sum, point) => sum + (typeof point.value === 'number' ? point.value : 0), 0);
  });

  readonly formattedTotal = computed(() => formatCount(this.total()));

  readonly segments = computed(() => {
    const response = this.response();
    const dimension = this.dimension();
    const total = this.total();
    if (!response || total === 0) {
      return [];
    }
    return response.data
      .filter(point => typeof point.value === 'number')
      .map((point, index) => {
        const value = point.value as number;
        const code = point.dimensions[dimension];
        return {
          code,
          label: this.labelByCode()[code] ?? code,
          value,
          percent: Math.round((value / total) * 100),
          color: colors[index % colors.length],
          formattedValue: formatCount(value)
        };
      });
  });

  readonly headlinePercent = computed(() => this.segments()[0]?.percent ?? 0);

  /** One category, one stacked bar — each segment is its own series so it can carry
   *  its own fixed color (not auto-assigned by Highcharts). */
  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const segments = this.segments();
    if (segments.length === 0) {
      return undefined;
    }
    return {
      chart: { type: 'bar', height: 54 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: [''], visible: false },
      yAxis: { min: 0, max: 100, visible: false, title: { text: undefined } },
      tooltip: { pointFormat: '{series.name}: {point.y}%' },
      plotOptions: {
        bar: {
          stacking: 'normal',
          borderWidth: 0,
          pointWidth: 24,
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            formatter: function (): string | null {
              return (this.y ?? 0) >= 0 ? `${this.y}%` : null;
            }
          }
        }
      },
      legend: { enabled: false },
      series: segments.map(segment => ({
        type: 'bar' as const,
        name: segment.label,
        data: [segment.percent],
        color: segment.color
      }))
    };
  });

  readonly ready = computed(() => this.response() !== undefined);
}
