import { Component, computed, inject, input } from "@angular/core";
import { SeriesOptionsType } from "highcharts";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-selector-bar-chart-card-view',
  templateUrl: './selector-bar-chart-card-view.html',
  imports: [ChartsModule, LoadingPlaceholder]
})
export class SelectorBarChartCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  presetCodes = input<string[]>([]);

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);

  private readonly categoryCodes = computed(() => {
    const preset = this.presetCodes();
    return preset.length > 0 ? preset : (this.members()?.map(m => m.code) ?? []);
  });
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );
  readonly categories = computed(() =>
    this.categoryCodes().map(code => this.labelByCode()[code] ?? code)
  );

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
    return response ? [...new Set(response.data.map(p => p.dimensions['period']))].sort((a, b) => a.localeCompare(b)) : [];
  });

  readonly chartSeries = computed<SeriesOptionsType[]>(() => {
    const response = this.response();
    const dimension = this.dimension();
    const codes = this.categoryCodes();
    if (!response) {
      return [];
    }
    const valueOf = (year: string, code: string) =>
      response.data.find(point =>
        point.dimensions['period'] === year && point.dimensions[dimension] === code
      )?.value;

    return this.years().map(year => ({
      type: 'column' as const,
      name: year,
      data: codes.map(code => {
        const value = valueOf(year, code);
        return typeof value === 'number' ? value : 0;
      })
    }));
  });

  readonly ready = computed(() => this.response() !== undefined && this.categoryCodes().length > 0);
}
