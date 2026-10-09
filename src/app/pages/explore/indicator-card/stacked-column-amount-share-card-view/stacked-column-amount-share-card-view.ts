import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";
import { formatCompactCurrency } from "../../../../domain/format-indicator-value";


export type StackedMode = 'amount' | 'share';

@Component({
  selector: 'app-stacked-column-amount-share-card-view',
  templateUrl: './stacked-column-amount-share-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class StackedColumnAmountShareCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  mode = input<StackedMode>('amount');

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

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );

  private readonly categories = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(point => point.dimensions['period']))].sort() : [];
  });

  /** Category codes in first-seen order — the order (and so the colors) the other
   *  breakdown views of the same indicator use. */
  private readonly codes = computed(() => {
    const response = this.response();
    const dimension = this.dimension();
    return response ? [...new Set(response.data.map(point => point.dimensions[dimension]))] : [];
  });

  /** Kept apart from chartOptions on purpose: it never reads mode(), so switching
   *  Amount / Share rebuilds the options but not this data. A year with no value
   *  stays null (no segment) instead of becoming a misleading 0. */
  private readonly series = computed<Highcharts.SeriesColumnOptions[]>(() => {
    const response = this.response();
    const dimension = this.dimension();
    const categories = this.categories();
    if (!response) {
      return [];
    }
    return this.codes().map((code, index) => ({
      type: 'column' as const,
      name: this.labelByCode()[code] ?? code,
      color: colors[index % colors.length],
      data: categories.map(period => {
        const point = response.data.find(p =>
          p.dimensions[dimension] === code && p.dimensions['period'] === period
        );
        return typeof point?.value === 'number' ? point.value : null;
      })
    }));
  });

  /** Sum over every category, per year. Rows without a number are skipped, so a year with no data is simply missing. */
  private readonly totalByYear = computed(() => {
    const totals: Record<string, number> = {};
    for (const point of this.response()?.data ?? []) {
      if (typeof point.value === 'number') {
        const year = point.dimensions['period'];
        totals[year] = (totals[year] ?? 0) + point.value;   // first row of a year starts from 0
      }
    }
    return totals;
  });

  readonly headline = computed(() => {
    const totals = this.totalByYear();              // e.g. { '2022': 145880000, '2024': 366095317 }
    const years = Object.keys(totals).sort();       // ['2022', '2024']
    const latestYear = years[years.length - 1];     // '2024'
    if (!latestYear) {
      return undefined;                             // no year has any data
    }

    const total = totals[latestYear];
    const startYear = String(this.customSearchService.startYear());
    const startTotal = totals[startYear];           // undefined if the start year has no data

    let delta: { text: string; baselineYear: string } | undefined;
    if (startTotal !== undefined && startYear !== latestYear) {
      const difference = total - startTotal;
      delta = { text: `${difference >= 0 ? '+' : '-'}${formatCompactCurrency(Math.abs(difference))}`, baselineYear: startYear };
    }

    return { year: latestYear, formattedTotal: formatCompactCurrency(total), delta };
  });

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    if (!this.response()) {
      return undefined;
    }
    const share = this.mode() === 'share';
    return {
      chart: { type: 'column', height: 280 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: this.categories() },
      yAxis: {
        min: 0,
        title: { text: undefined },
        labels: {
          formatter: function () {
            const value = Number(this.value);
            if (share) {
              return `${value}%`;
            }
            return value === 0 ? '0' : formatCompactCurrency(value);
          }
        }
      },
      tooltip: {
        pointFormatter: function () {
          const amount = formatCompactCurrency(this.y ?? 0);
          const value = share ? `${(this.percentage ?? 0).toFixed(0)}% (${amount})` : amount;
          return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`;
        }
      },
      plotOptions: {
        column: { stacking: share ? 'percent' : 'normal' }
      },
      series: this.series()
    };
  });
}
