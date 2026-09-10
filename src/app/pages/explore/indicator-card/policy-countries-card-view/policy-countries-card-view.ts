import { Component, computed, inject, input } from "@angular/core";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { countryStatusBadge } from "../../../../domain/policy-status";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-policy-countries-card-view',
  templateUrl: './policy-countries-card-view.html',
  imports: [LoadingPlaceholder]
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

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

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
}
