import { Component, computed, inject, input } from "@angular/core";
import { CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { countryStatusBadge } from "../../../../domain/policy-status";
import { CardState } from "../../../../shared/card-state/card-state";

@Component({
  selector: 'app-policy-countries-card-view',
  templateUrl: './policy-countries-card-view.html',
  imports: [CardState]
})
export class PolicyCountriesCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.endYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);

  private readonly response = computed(() => dataOf(this.state()));

  readonly countryStatuses = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    return resolveSelectedCountries(this.customSearchService.selectedCountryIds()).map(country => {
      const value = response.data.find(point => point.dimensions['country'] === country.id)?.value;
      return {
        id: country.id,
        name: country.name,
        badge: countryStatusBadge(value)
      };
    });
  });

  readonly positiveCount = computed(() =>
    this.countryStatuses()?.filter(row => row.badge.text === 'Yes').length
  );

  readonly totalCount = computed(() => this.countryStatuses()?.length);

  readonly isEmpty = computed(() => (this.response()?.data.length ?? 0) === 0);
}
