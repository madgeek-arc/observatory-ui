import { Component, computed, inject } from "@angular/core";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { CustomSearchService } from "../../custom-search/services/custom-search.service";

@Component({
  selector: 'app-policy-countries-card-view',
  templateUrl: './policy-countries-card-view.html',
  imports: []
})
export class PolicyCountriesCardView {
  private readonly customSearchService = inject(CustomSearchService);

  readonly isSnapshot = computed(() => this.customSearchService.startYear() === this.customSearchService.endYear());

  readonly mockCountryPolicyStatus = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds())
      .map((country, idx) => ({ ...country, since: 2024 - idx * 10 }))
  );

  readonly periodLabel = computed(() =>
    this.isSnapshot()
      ? `${this.customSearchService.startYear()}`
      : `${this.customSearchService.startYear()}–${this.customSearchService.endYear()}`
  );
}
