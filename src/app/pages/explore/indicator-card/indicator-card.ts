import { Component, computed, input, output } from "@angular/core";
import { ExploreIndicatorConfig } from "../../../domain/explore-indicators";
import { EuSnapshotCardView } from "./eu-snapshot-card-view/eu-snapshot-card-view";
import { EuTrendCardView } from "./eu-trend-card-view/eu-trend-card-view";
import { CountriesTrendCardView } from "./countries-trend-card-view/countries-trend-card-view";
import { CountriesSnapshotCardView } from "./countries-snapshot-card-view/countries-snapshot-card-view";
import { PolicyMapCardView } from "./policy-map-card-view/policy-map-card-view";
import { PolicyCountriesCardView } from "./policy-countries-card-view/policy-countries-card-view";

@Component({
  selector: 'app-indicator-card',
  templateUrl: './indicator-card.html',
  imports: [
    EuSnapshotCardView,
    EuTrendCardView,
    CountriesTrendCardView,
    CountriesSnapshotCardView,
    PolicyMapCardView,
    PolicyCountriesCardView
  ]
})
export class IndicatorCard {
  indicator = input.required<ExploreIndicatorConfig>();
  geographyScope = input.required<'all' | 'select'>();
  startYear = input.required<number>();
  endYear = input.required<number>();
  selectedCountryIds = input.required<Set<string>>();

  readonly closeCard = output<string>();

  readonly cardViewKind = computed<'eu-snapshot' | 'eu-trend' | 'countries-trend' | 'countries-snapshot' | 'policy-map' | 'policy-countries'>(() => {
    if (this.indicator().chartType === 'POLICY') {
      return this.geographyScope() === 'all' ? 'policy-map' : 'policy-countries';
    }

    const isEU = this.geographyScope() === 'all';
    const isSnapshot = this.startYear() === this.endYear();

    if (isEU && isSnapshot) return 'eu-snapshot';
    if (isEU && !isSnapshot) return 'eu-trend';
    if (!isEU && !isSnapshot) return 'countries-trend';
    return 'countries-snapshot';
  });
}


