import { Component, computed, inject, input } from "@angular/core";
import * as Highcharts from "highcharts";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { colors } from "../../../../domain/chart-color-palette";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-stacked-column-with-totals-card-view',
  templateUrl: './stacked-column-with-totals-card-view.html',
  imports: [ChartsModule, LoadingPlaceholder]
})
export class StackedColumnWithTotalsCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();

  readonly tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

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

  readonly categories = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(point => point.dimensions['period']))].sort() : [];
  });

  /** Category codes in first-seen order — matches the order StackedBarWithProgressCardView
   *  assigns colors in for the same indicator's single-year view, so the two views stay visually consistent. */
  private readonly codes = computed(() => {
    const response = this.response();
    const dimension = this.dimension();
    if (!response) {
      return [];
    }
    const seen: string[] = [];
    for (const point of response.data) {
      const code = point.dimensions[dimension];
      if (!seen.includes(code)) {
        seen.push(code);
      }
    }
    return seen;
  });

  readonly chartSeries = computed<Highcharts.SeriesColumnOptions[]>(() => {
    const response = this.response();
    const dimension = this.dimension();
    const categories = this.categories();
    if (!response) {
      return [];
    }
    return this.codes().map((code, index) => ({
      type: 'column',
      name: this.labelByCode()[code] ?? code,
      color: colors[index % colors.length],
      data: categories.map(period => {
        const point = response.data.find(p =>
          p.dimensions[dimension] === code && p.dimensions['period'] === period
        );
        return typeof point?.value === 'number' ? point.value : 0;
      })
    }));
  });

  /** Hardcoded to the "OA" access-status code — same simplification as
   *  StackedBarWithProgressCardView's headline, not yet generalized for od-4. */
  private percentOpenAccessFor(period: string | undefined): number {
    const response = this.response();
    const dimension = this.dimension();
    if (!response || !period) {
      return 0;
    }
    const rows = response.data.filter(point =>
      point.dimensions['period'] === period && typeof point.value === 'number'
    );
    const total = rows.reduce((sum, point) => sum + (point.value as number), 0);
    const oaValue = rows.find(point => point.dimensions[dimension] === 'OA')?.value;
    return total > 0 && typeof oaValue === 'number' ? Math.round((oaValue / total) * 100) : 0;
  }

  readonly firstYear = computed(() => this.categories()[0]);
  readonly latestYear = computed(() => this.categories()[this.categories().length - 1]);
  readonly latestPercent = computed(() => this.percentOpenAccessFor(this.latestYear()));
  readonly deltaVsFirstYear = computed(() => {
    const categories = this.categories();
    if (categories.length < 2) {
      return undefined;
    }
    return this.latestPercent() - this.percentOpenAccessFor(this.firstYear());
  });

  readonly ready = computed(() => this.response() !== undefined);
}
