import { Component, computed, inject, input } from "@angular/core";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { isPositiveStatus } from "../../../../domain/policy-status";
import { colors } from "../../../../domain/chart-color-palette";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-selector-yes-no-table-card-view',
  templateUrl: './selector-yes-no-table-card-view.html',
  imports: [LoadingPlaceholder]
})
export class SelectorYesNoTableCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  presetCodes = input<string[]>([]);

  readonly positiveColor = colors[0];
  readonly negativeColor = '#eef1f3';

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
  private readonly countriesResponse = this.customSearchService.queryIndicatorSignal(this.countriesQueryParams);

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
  private readonly euResponse = this.customSearchService.queryIndicatorSignal(this.euQueryParams);

  readonly rows = computed(() => {
    const countriesResponse = this.countriesResponse();
    const euResponse = this.euResponse();
    const dimension = this.dimension();
    if (!countriesResponse || !euResponse) {
      return [];
    }
    const unit = countriesResponse.metadata.unit;

    return this.areas().map(area => ({
      label: area.label,
      cells: this.countries().map(country => {
        const value = countriesResponse.data.find(point =>
          point.dimensions['country'] === country.id && point.dimensions[dimension] === area.code
        )?.value;
        return value !== undefined && isPositiveStatus(value, unit);
      }),
      euValue: euResponse.data.find(point => point.dimensions[dimension] === area.code)?.value
    }));
  });

  readonly ready = computed(() => this.countriesResponse() !== undefined && this.euResponse() !== undefined);
}
