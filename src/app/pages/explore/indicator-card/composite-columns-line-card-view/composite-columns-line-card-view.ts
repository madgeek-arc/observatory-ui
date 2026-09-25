import { Component, computed, inject, input } from "@angular/core";
import * as Highcharts from "highcharts";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

interface CountryColumnChart {
  id: string;
  name: string;
  series: Highcharts.SeriesColumnOptions[];
  latestPercent: number;
}

@Component({
  selector: 'app-composite-columns-line-card-view',
  templateUrl: 'composite-columns-line-card-view.html',
  imports: [ChartsModule, LoadingPlaceholder]
})
export class CompositeColumnsLineCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();

  readonly tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';
  readonly legendOff: Highcharts.LegendOptions = { enabled: false };

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
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

  /** Codes in first-seen order across the WHOLE combined response (not per-country), so
   *  every country's chart — and the shared legend below the grid — assigns the same
   *  color to the same category, even if one country is missing a category the others have. */
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

  private readonly valueByKey = computed(() => {
    const response = this.response();
    const dimension = this.dimension();
    const map = new Map<string, number>();
    if (!response) {
      return map;
    }
    for (const point of response.data) {
      if (typeof point.value !== 'number') {
        continue;
      }
      const key = `${point.dimensions['country']}|${point.dimensions[dimension]}|${point.dimensions['period']}`;
      map.set(key, point.value);
    }
    return map;
  });

  private percentOpenAccessFor(countryId: string, period: string | undefined): number {
    if (!period) {
      return 0;
    }
    const valueByKey = this.valueByKey();
    const total = this.codes().reduce(
      (sum, code) => sum + (valueByKey.get(`${countryId}|${code}|${period}`) ?? 0), 0
    );
    const oaValue = valueByKey.get(`${countryId}|OA|${period}`) ?? 0;
    return total > 0 ? Math.round((oaValue / total) * 100) : 0;
  }

  readonly countryCharts = computed<CountryColumnChart[]>(() => {
    const response = this.response();
    if (!response) {
      return [];
    }
    const codes = this.codes();
    const categories = this.categories();
    const valueByKey = this.valueByKey();
    const latestYear = categories[categories.length - 1];

    return resolveSelectedCountries(this.customSearchService.selectedCountryIds()).map(country => ({
      id: country.id,
      name: country.name,
      series: codes.map((code, index) => ({
        type: 'column' as const,
        name: this.labelByCode()[code] ?? code,
        color: colors[index % colors.length],
        data: categories.map(year => valueByKey.get(`${country.id}|${code}|${year}`) ?? 0)
      })),
      latestPercent: this.percentOpenAccessFor(country.id, latestYear)
    }));
  });

  readonly legendItems = computed(() =>
    this.codes().map((code, index) => ({
      code,
      label: this.labelByCode()[code] ?? code,
      color: colors[index % colors.length]
    }))
  );

  readonly ready = computed(() => this.response() !== undefined);
}
