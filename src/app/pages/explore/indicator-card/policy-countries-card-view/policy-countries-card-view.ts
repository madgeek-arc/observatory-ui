import { Component, computed, inject, input } from "@angular/core";
import { CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { statusBadge, yesSinceYear } from "../../../../domain/policy-status";
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
      yearFrom: this.customSearchService.startYear(),
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
    const unit = response.metadata.unit;
    const startYear = this.customSearchService.startYear();
    const endYear = this.customSearchService.endYear();
    return resolveSelectedCountries(this.customSearchService.selectedCountryIds()).map(country => {
      const statusByYear = new Map(
        response.data
          .filter(point => point.dimensions['country'] === country.id)
          .map(point => [Number(point.dimensions['period']), point.value])
      );
      const badge = statusBadge(statusByYear.get(endYear), unit);
      return {
        id: country.id,
        name: country.name,
        badge,
        sinceYear: badge.text === 'Yes' ? yesSinceYear(statusByYear, startYear, endYear, unit) : undefined
      };
    });
  });

  readonly positiveCount = computed(() =>
    this.countryStatuses()?.filter(row => row.badge.text === 'Yes').length
  );

  readonly totalCount = computed(() => this.countryStatuses()?.length);

  readonly startYear = computed(() => this.customSearchService.startYear());
  readonly endYear = computed(() => this.customSearchService.endYear());

  /** A single year has no earlier year to compare with, so the 'since' note only shows for a range. */
  readonly isRange = computed(() => this.startYear() < this.endYear());

  readonly isEmpty = computed(() => (this.response()?.data.length ?? 0) === 0);
}
