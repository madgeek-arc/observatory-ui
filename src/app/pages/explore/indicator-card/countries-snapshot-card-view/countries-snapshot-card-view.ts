import { Component, computed, input } from "@angular/core";
import { countries } from "../../../../domain/countries";

@Component({
  selector: 'app-countries-snapshot-card-view',
  templateUrl: './countries-snapshot-card-view.html',
  imports: []
})
export class CountriesSnapshotCardView {
  selectedCountryIds = input.required<Set<string>>();

  readonly mockCountryValues = computed(() =>
    [...this.selectedCountryIds()]
      .map(id => countries.find(c => c.id === id))
      .filter((c): c is { id: string; name: string } => !!c)
      .map((country, idx) => ({ ...country, value: 40 + idx * 12 }))
  );
}
