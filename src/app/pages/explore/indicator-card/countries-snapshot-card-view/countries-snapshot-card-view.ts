import { Component, computed, inject, input } from "@angular/core";
import { CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { IndicatorFormat } from "../../../../domain/explore-indicators";
import { formatIfNumber } from "../../../../domain/format-indicator-value";
import { CardState } from "../../../../shared/card-state/card-state";

@Component({
  selector: 'app-countries-snapshot-card-view',
  templateUrl: './countries-snapshot-card-view.html',
  imports: [CardState]
})
export class CountriesSnapshotCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  format = input.required<IndicatorFormat>();

  readonly selectedCountries = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds())
  );

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.startYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);

  private readonly response = computed(() => dataOf(this.state()));

  readonly countryValues = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    return this.selectedCountries().map(country => {
      const value = response.data.find(point => point.dimensions['country'] === country.id)?.value;
      return {
        id: country.id,
        name: country.name,
        value,
        formattedValue: formatIfNumber(value, this.format())
      };
    });
  });

  readonly isEmpty = computed(() => (this.countryValues() ?? []).every(item => item.formattedValue === undefined));
}
