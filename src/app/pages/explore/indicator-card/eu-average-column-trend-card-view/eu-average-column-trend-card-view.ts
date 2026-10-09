import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-eu-average-column-trend-card-view',
  templateUrl: './eu-average-column-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class EuAverageColumnTrendCardView {
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

  /** Average per year over the countries that have a value that year. A country without
   *  a value is left out, not counted as 0; a year where no country has one stays with a null average. */
  readonly yearlyAverages = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const byYear = new Map<string, number[]>();
    for (const point of response.data) {
      const year = point.dimensions['period'];
      const values = byYear.get(year) ?? [];
      if (typeof point.value === 'number') {
        values.push(point.value);
      }
      byYear.set(year, values);
    }
    return [...byYear.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, values]) => ({
        year,
        average: values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null
      }));
  });

  /** Last year in the range — the headline describes this one. */
  private readonly latest = computed(() => {
    const averages = this.yearlyAverages();
    return averages ? averages[averages.length - 1] : undefined;
  });

  readonly latestYear = computed(() => this.latest()?.year);

  /** Rounded to 1 decimal, same as the column labels. */
  readonly latestAverage = computed(() => {
    const average = this.latest()?.average;
    return average == null ? undefined : +average.toFixed(1);
  });

  /** "out of N" — every row carries the same total, taken from the latest year's rows. */
  readonly totalAreas = computed(() =>
    this.response()?.data.find(point =>
      point.dimensions['period'] === this.latestYear() && typeof point.total === 'number'
    )?.total
  );

  /** "Policy Areas Count" → "policy areas". A label without " Count" just stays as is. */
  readonly unitLabel = computed(() =>
    (this.response()?.metadata.label ?? '').replace(/\s*count$/i, '').toLowerCase()
  );

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const averages = this.yearlyAverages();
    if (!averages) {
      return undefined;
    }
    return {
      chart: { type: 'column', height: 220 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: averages.map(item => item.year) },
      yAxis: { min: 0, title: { text: undefined } },
      tooltip: { enabled: false },
      plotOptions: {
        column: {
          color: colors[0],
          dataLabels: { enabled: true, format: '{point.formattedValue}' }
        }
      },
      legend: { enabled: false },
      series: [{
        type: 'column',
        name: 'EU average',
        data: averages.map(item => ({
          y: item.average,
          formattedValue: item.average === null ? '' : String(+item.average.toFixed(1))
        }))
      }]
    };
  });
}
