import { Component, computed, inject, input } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs/operators";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { countries } from "../../../../domain/countries";
import { IndicatorFormat } from "../../../../domain/explore-indicators";
import { formatIndicatorValue } from "../../../../domain/format-indicator-value";

@Component({
  selector: 'app-countries-snapshot-card-view',
  templateUrl: './countries-snapshot-card-view.html',
  imports: []
})
export class CountriesSnapshotCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  startYear = input.required<number>();
  format = input.required<IndicatorFormat>();
  selectedCountryIds = input.required<Set<string>>();

  readonly selectedCountries = computed(() =>
    [...this.selectedCountryIds()]
      .map(id => countries.find(c => c.id === id))
      .filter((c): c is { id: string; name: string } => !!c)
  );

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.selectedCountryIds()],
      yearFrom: this.startYear(),
      yearTo: this.startYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = toSignal(
    toObservable(this.queryParams).pipe(
      switchMap(({ id, request }) => this.customSearchService.queryIndicator(id, request))
    )
  );

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
        formattedValue: typeof value === 'number' ? formatIndicatorValue(value, this.format()) : undefined
      };
    });
  });
}
