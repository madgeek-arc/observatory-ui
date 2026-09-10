import { Component, computed, inject, input, signal } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { ACCESS_TYPE_LABELS, ACCESS_TYPES, CLASSIFICATION_LABELS, CLASSIFICATIONS } from "../../../../domain/oa-license-status";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-selector-trend-card-view',
  templateUrl: './selector-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class SelectorTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;
  readonly accessTypes = ACCESS_TYPES;
  readonly accessTypeLabels = ACCESS_TYPE_LABELS;
  readonly colors = colors;
  readonly selectedAccessType = signal(ACCESS_TYPES[0]);

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

  private readonly years = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(point => point.dimensions['period']))].sort() : undefined;
  });


  private readonly valueByKey = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const map = new Map<string, number>();
    for (const point of response.data) {
      const key = `${point.dimensions['oaLicenseStatus']}|${point.dimensions['classification']}|${point.dimensions['period']}`;
      map.set(key, point.value as number);
    }
    return map;
  });


  private readonly shareSeries = computed(() => {
    const valueByKey = this.valueByKey();
    const years = this.years();
    if (!valueByKey || !years) {
      return undefined;
    }
    const accessType = this.selectedAccessType();

    return CLASSIFICATIONS.map(classification => ({
      classification,
      data: years.map(year => {
        const total = ACCESS_TYPES.reduce(
          (sum, type) => sum + (valueByKey.get(`${type}|${classification}|${year}`) ?? 0), 0
        );
        const value = valueByKey.get(`${accessType}|${classification}|${year}`) ?? 0;
        return total > 0 ? Math.round((value / total) * 100) : 0;
      })
    }));
  });


  readonly latestShares = computed(() => {
    const series = this.shareSeries();
    if (!series) {
      return undefined;
    }
    return series.map(s => ({ label: CLASSIFICATION_LABELS[s.classification], value: s.data[s.data.length - 1] }));
  });

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const series = this.shareSeries();
    const years = this.years();
    if (!series || !years) {
      return undefined;
    }

    return {
      chart: { type: 'line', height: 260 },
      colors,
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: years },
      yAxis: { min: 0, max: 100, title: { text: undefined } },
      tooltip: { pointFormat: '{series.name}: {point.y}%' },
      plotOptions: {
        line: { marker: { enabled: true, radius: 4, symbol: 'circle' } }
      },
      legend: { enabled: false },
      series: series.map(s => ({
        type: 'line' as const,
        name: CLASSIFICATION_LABELS[s.classification],
        data: s.data
      }))
    };
  });

  selectAccessType(type: string) {
    this.selectedAccessType.set(type);
  }
}
