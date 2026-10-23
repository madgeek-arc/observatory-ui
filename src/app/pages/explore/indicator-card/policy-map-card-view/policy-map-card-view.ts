import { Component, computed, inject, input } from "@angular/core";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { CategorizedAreaData, Series } from "../../../../domain/categorizedAreaData";
import { CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { CardState } from "../../../../shared/card-state/card-state";
import { colorForStatus, isPositiveStatus } from "../../../../domain/policy-status";

/** Legend order */
const LEGEND_ORDER = [
  'Mandatory policy',
  'Policy but not mandatory',
  'Has national monitoring',
  'No policy',
  'Does not have national monitoring',
  'Awaiting data',
  'N/A'
];

@Component({
  selector: 'app-policy-map-card-view',
  templateUrl: './policy-map-card-view.html',
  imports: [ChartsModule, CardState]
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

  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);

  private readonly response = computed(() => dataOf(this.state()));

  readonly mapData = computed<CategorizedAreaData | undefined>(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }

    const groups = new Map<string, string[]>(LEGEND_ORDER.map(status => [status, []]));
    for (const point of response.data) {
      const rawValue = String(point.value);
      const countryCode = point.dimensions['country'];
      if (!groups.has(rawValue)) {
        groups.set(rawValue, []);
      }
      groups.get(rawValue)!.push(countryCode);
    }

    const data = new CategorizedAreaData();
    data.series = [...groups.entries()]
      .filter(([, countryCodes]) => countryCodes.length > 0)
      .map(([rawValue, countryCodes], index) => {
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

  readonly isEmpty = computed(() => (this.response()?.data.length ?? 0) === 0);
}
