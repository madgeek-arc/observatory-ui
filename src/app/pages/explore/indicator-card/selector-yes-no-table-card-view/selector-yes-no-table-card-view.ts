import { Component, computed, inject, input } from "@angular/core";
import { combineStates, CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { legendForGroup, statusCategory } from "../../../../domain/policy-status";
import { colors } from "../../../../domain/chart-color-palette";
import { CardState } from "../../../../shared/card-state/card-state";
import { formatIfNumber } from "../../../../domain/format-indicator-value";

@Component({
  selector: 'app-selector-yes-no-table-card-view',
  templateUrl: './selector-yes-no-table-card-view.html',
  imports: [CardState]
})
export class SelectorYesNoTableCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  presetCodes = input<string[]>([]);

  readonly positiveColor = colors[0];
  readonly negativeColor = '#eef1f3';
  readonly awaitingColor = colors[7];

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
  /** Every area in a preset belongs to one group (POLICY / FINANCIAL_STRATEGY / MONITORING_INITIATIVE),
   *  so the first area's group decides the legend wording. */
  readonly legend = computed(() => {
    const groupByCode = new Map((this.members() ?? []).map(m => [m.code, m.group]));
    const firstCode = this.categoryCodes()[0];
    return legendForGroup(firstCode ? groupByCode.get(firstCode) : undefined);
  });
  private readonly areas = computed(() =>
    this.categoryCodes().map(code => ({ code, label: this.labelByCode()[code] ?? code }))
  );

  readonly countries = computed(() => resolveSelectedCountries(this.customSearchService.selectedCountryIds()));

  /** Per selected country — drives the yes/no cells. */
  private readonly countriesQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.endYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  private readonly countriesState = this.customSearchService.queryIndicatorState(this.countriesQueryParams);
  private readonly countriesResponse = computed(() => dataOf(this.countriesState()));

  /** ALL_COUNTRIES — drives the EU reference column only. */
  private readonly euQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.endYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  private readonly euState = this.customSearchService.queryIndicatorState(this.euQueryParams);
  private readonly euResponse = computed(() => dataOf(this.euState()));

  /** The card waits for both requests — see combineStates. */
  readonly state = computed(() => combineStates(this.countriesState(), this.euState()));

  readonly rows = computed(() => {
    const countriesResponse = this.countriesResponse();
    const euResponse = this.euResponse();
    const dimension = this.dimension();
    if (!countriesResponse || !euResponse) {
      return [];
    }
    const unit = countriesResponse.metadata.unit;
    const excluded = this.excludedAreas();
    return this.areas()
      .filter(area => !excluded.has(area.code))
      .map(area => ({
      label: area.label,
      cells: this.countries().map(country => {
        const value = countriesResponse.data.find(point =>
          point.dimensions['country'] === country.id && point.dimensions[dimension] === area.code
        )?.value;
        const status = statusCategory(value, unit);
        return {
          status,
          color: status === 'positive' ? this.positiveColor : status === 'awaiting' ? this.awaitingColor : this.negativeColor,
          symbol: status === 'positive' ? '✓' : status === 'awaiting' ? '–' : ''
        };
      }),
      euValue: formatIfNumber(euResponse.data.find(point => point.dimensions[dimension] === area.code)?.value, 'percentage')
    }));
  });

  readonly isEmpty = computed(() => (this.countriesResponse()?.data.length ?? 0) === 0);


  /** Members the backend excluded for this period(e.g. QUESTION_PAUSED) - hidden from the table **/
  private readonly excludedAreas = computed(() => {
    const dimension = this.dimension();
    return new Set(
      (this.countriesResponse()?.exclusions ?? [])
        .filter(exclusion => exclusion.dimension === dimension)
        .map(exclusion => exclusion.member)
    )
  })
}
