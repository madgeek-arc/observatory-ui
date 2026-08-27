import { Component, computed, input } from "@angular/core";
import { countries } from "../../../../domain/countries";

@Component({
  selector: 'app-policy-countries-card-view',
  templateUrl: './policy-countries-card-view.html',
  imports: []
})
export class PolicyCountriesCardView {
  startYear = input.required<number>();
  endYear = input.required<number>();
  selectedCountryIds = input.required<Set<string>>();

  readonly isSnapshot = computed(() => this.startYear() === this.endYear());

  readonly mockCountryPolicyStatus = computed(() =>
    [...this.selectedCountryIds()]
      .map(id => countries.find(c => c.id === id))
      .filter((c): c is { id: string; name: string } => !!c)
      .map((country, idx) => ({ ...country, since: 2024 - idx * 10 }))
  );

  readonly periodLabel = computed(() =>
    this.isSnapshot() ? `${this.startYear()}` : `${this.startYear()}–${this.endYear()}`
  );
}
