import { Component, computed, inject, input } from "@angular/core";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { CategorizedAreaData, Series } from "../../../../domain/categorizedAreaData";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  'Mandatory policy': { label: 'Has mandatory national policy', color: '#0B1D51' },
  'Policy but not mandatory': { label: 'Has national policy but not mandatory', color: '#4CE0B3' },
  'No policy': { label: 'Does not have national policy', color: '#EB5C80' },
  'Awaiting data': { label: 'Awaiting Data', color: '#9AA5B1' },
  'YES': { label: 'Yes', color: '#0B1D51' },
  'NO': { label: 'No', color: '#EB5C80' },
};

const POSITIVE_VALUES = ['Mandatory policy', 'Policy but not mandatory', 'YES'];

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
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.startYear(),
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
      const style = CATEGORY_STYLES[rawValue] ?? { label: rawValue, color: '#9AA5B1' };
      const series = new Series(style.label, index === 0);
      series.showInLegend = true;
      series.color = style.color;
      series.data = countryCodes.map(code => ({ code }));
      return series;
    });
    return data;
  });

  readonly totalCount = computed(() => this.response()?.data.length);

  readonly positiveCount = computed(() =>
    this.response()?.data.filter(point => POSITIVE_VALUES.includes(String(point.value))).length
  );
}
