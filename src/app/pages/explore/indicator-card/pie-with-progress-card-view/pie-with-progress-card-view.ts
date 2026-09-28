import {Component, computed, inject, input} from "@angular/core";
import * as Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import {CustomSearchService, IndicatorPresetQueryRequest} from "../../custom-search/services/custom-search.service";
import { colors } from "../../../../domain/chart-color-palette";
import { formatIndicatorValue } from "../../../../domain/format-indicator-value";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

interface AreaShare {
  code: string;
  label: string;
  value: number;
  percent: number;
  color: string;
  formattedValue: string;
}

@Component({
  selector: 'app-pie-with-progress-card-view',
  templateUrl: './pie-with-progress-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class PieWithProgressCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();

  endYear = computed(() => this.customSearchService.endYear());

  Highcharts: typeof Highcharts = Highcharts;

  /** ALL_COUNTRIES, one year */

  private queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.endYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  /** query for labels */
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
    return response ? response.data.reduce((sum, point) => sum + (typeof point.value === 'number' ? point.value : 0), 0) : 0;
  });
  readonly formattedTotal = computed(() => formatIndicatorValue(this.total(), 'currency'));

  readonly areas = computed<AreaShare[]>(() => {
    const response = this.response();
    const total = this.total();
    if (!response) {
      return [];
    }
    return response.data
      .filter(point => typeof point.value === 'number')
      .map(point => {
        const code = point.dimensions[this.dimension()];
        return {
          code,
          label: this.labelByCode()[code] ?? code,
          value: point.value as number,
          percent: total > 0 ? Math.round((point.value as number) / total * 100) : 0
        };
      })
      .sort((a, b) => b.value - a.value)
      .map((area, index) => ({
        ...area,
        color: colors[index % colors.length],
        formattedValue: formatIndicatorValue(area.value, 'currency')
      }));
  });

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const areas = this.areas();
    if (areas.length === 0) {
      return undefined;
    }
    return {
      chart: { type: 'pie', height: 280 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      legend: { enabled: false },
      tooltip: {
        pointFormat: '{point.formattedValue} · {point.percent}%'
      },
      plotOptions: {
        pie: {
          innerSize: '65%',
          borderWidth: 0,
          dataLabels: { enabled: false }
        }
      },
      series: [{
        type: 'pie',
        name: 'Investment',
        data: areas.map(area => ({
          name: area.label,
          y: area.value,
          color: area.color,
          formattedValue: area.formattedValue,
          percent: area.percent
        }))
      }]
    };
  });
}
