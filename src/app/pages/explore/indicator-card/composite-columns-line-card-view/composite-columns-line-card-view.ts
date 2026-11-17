import { Component, computed, inject, input } from "@angular/core";
import * as Highcharts from "highcharts";
import { CustomSearchService, dataOf, hasNumericValue, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { HighchartsChartModule } from "highcharts-angular";
import { formatIndicatorValue, formatPercent, roundHalfUp } from "../../../../domain/format-indicator-value";
import { IndicatorFormat } from "../../../../domain/explore-indicators";
import { stackedColumnOptions } from "../stacked-column-options";
import { CardState } from "../../../../shared/card-state/card-state";

interface CountryColumnChart {
  id: string;
  name: string;
  chartOptions: Highcharts.Options;
  headline: string;
}

@Component({
  selector: 'app-composite-columns-line-card-view',
  templateUrl: 'composite-columns-line-card-view.html',
  imports: [HighchartsChartModule, CardState]
})
export class CompositeColumnsLineCardView {
  Highcharts: typeof Highcharts = Highcharts;
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  format = input.required<IndicatorFormat>();


  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);
  private readonly response = computed(() => dataOf(this.state()));

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );
  /** Open access = every member the backend groups as OPEN_ACCESS (e.g. with + without
   *  licence); the 'OA' fallback covers members that have no group yet. */
  private readonly openAccessCodes = computed(() => new Set(
    (this.members() ?? [])
      .filter(member => member.group === 'OPEN_ACCESS' || member.code === 'OA')
      .map(member => member.code)
  ));

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
    const oaValue = [...this.openAccessCodes()].reduce(
      (sum, code) => sum + (valueByKey.get(`${countryId}|${code}|${period}`) ?? 0), 0
    );
    return total > 0 ? roundHalfUp((oaValue / total) * 100) : 0;
  }

  /** Sum of every breakdown member for one country and year; null when the country has no values. */
  private totalFor(countryId: string, period: string | undefined): number | null {
    if (!period) {
      return null;
    }
    const valueByKey = this.valueByKey();
    const values = this.codes()
      .map(code => valueByKey.get(`${countryId}|${code}|${period}`))
      .filter((value): value is number => value !== undefined);
    return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) : null;
  }

  /** "% OA" when the breakdown has open-access members; otherwise the latest-year total,
   *  since an open-access share means nothing for e.g. investments by area. */
  private headlineFor(countryId: string, period: string | undefined): string {
    if (this.openAccessCodes().size > 0) {
      return `${formatPercent(this.percentOpenAccessFor(countryId, period))} OA`;
    }
    const total = this.totalFor(countryId, period);
    return total === null ? '–' : `${formatIndicatorValue(total, this.format())} in ${period}`;
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
      chartOptions: stackedColumnOptions(categories, codes.map((code, index) => ({
        type: 'column' as const,
        name: this.labelByCode()[code] ?? code,
        color: colors[index % colors.length],
        data: categories.map(year => valueByKey.get(`${country.id}|${code}|${year}`) ?? 0)
      })), 200, { enabled: false }),
      headline: this.headlineFor(country.id, latestYear)
    }));
  });

  readonly legendItems = computed(() =>
    this.codes().map((code, index) => ({
      code,
      label: this.labelByCode()[code] ?? code,
      color: colors[index % colors.length]
    }))
  );

  readonly isEmpty = computed(() => !hasNumericValue(this.response()));
}
