import { Component, computed, inject, input } from "@angular/core";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { CategorizedAreaData, Series } from "../../../../domain/categorizedAreaData";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";
import { colorForStatus, isPositiveStatus } from "../../../../domain/policy-status";

@Component({
  selector: 'app-policy-map-card-view',
  templateUrl: './policy-map-card-view.html',
  imports: [ChartsModule, LoadingPlaceholder]
})
export class PolicyMapCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.endYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  readonly mapData = computed<CategorizedAreaData | undefined>(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }

    const groups = new Map<string, string[]>();
    for (const point of response.data) {
      const rawValue = String(point.value);
      const countryCode = point.dimensions['country'];
      if (!groups.has(rawValue)) {
        groups.set(rawValue, []);
      }
      groups.get(rawValue)!.push(countryCode);
    }

    const data = new CategorizedAreaData();
    data.series = [...groups.entries()].map(([rawValue, countryCodes], index) => {
      const series = new Series(rawValue, index === 0);
      series.showInLegend = true;
      series.color = colorForStatus(rawValue);
      series.data = countryCodes.map(code => ({ code }));
      return series;
    });
    return data;
  });

  readonly totalCount = computed(() => this.response()?.data.length);

  readonly positiveCount = computed(() =>
    this.response()?.data.filter(point => isPositiveStatus(String(point.value))).length
  );
}
