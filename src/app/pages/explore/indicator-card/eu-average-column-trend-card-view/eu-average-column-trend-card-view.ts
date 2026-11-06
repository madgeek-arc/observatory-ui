import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { CardState } from "../../../../shared/card-state/card-state";
import { StatusBadge } from "../../../../domain/policy-status";

/** Number of areas tracked in a usual year — any other total gets an asterisk and a footnote. */
const EXPECTED_AREAS = 12;

@Component({
  selector: 'app-eu-average-column-trend-card-view',
  templateUrl: './eu-average-column-trend-card-view.html',
  imports: [HighchartsChartModule, CardState]
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

  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);
  private readonly response = computed(() => dataOf(this.state()));

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

  readonly latestAverage = computed(() => {
    const average = this.latest()?.average;
    return average == null ? undefined : +average.toFixed(1);
  });

  readonly changeSinceStart = computed<StatusBadge | undefined>(() => {
    const startYear = this.customSearchService.startYear();
    const first = this.yearlyAverages()?.find(item => item.year === String(startYear));
    const latest = this.latest();
    if (!first || !latest || first.year === latest.year || first.average === null || latest.average === null) {
      return undefined;
    }
    const difference = +(+latest.average.toFixed(1) - +first.average.toFixed(1)).toFixed(1);
    if (difference > 0) {
      return { text: `+${difference} vs ${startYear}`, cssClass: 'uk-text-success' };
    }
    if (difference < 0) {
      return { text: `${difference} vs ${startYear}`, cssClass: 'uk-text-danger' };
    }
    return { text: `0 vs ${startYear}`, cssClass: 'uk-text-muted' };
  });

  /** "out of N" — every row carries the same total, taken from the latest year's rows. */
  readonly totalAreas = computed(() =>
    this.response()?.data.find(point =>
      point.dimensions['period'] === this.latestYear() && typeof point.total === 'number'
    )?.total
  );

  /** Note for a total that differs from the usual number of areas; none when it matches. */
  readonly areasNote = computed(() => {
    const total = this.totalAreas();
    if (total === undefined || total === EXPECTED_AREAS) {
      return undefined;
    }
    return total < EXPECTED_AREAS
      ? `Not all areas tracked in ${this.latestYear()}`
      : `More than 12 areas tracked in ${this.latestYear()}`;
  });

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
      yAxis: { min: 0, maxPadding: 0.5, title: { text: undefined } },
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

  readonly isEmpty = computed(() => !(this.yearlyAverages() ?? []).some(item => item.average !== null));
}
