import { Component, computed, input } from "@angular/core";
import { ExploreIndicatorConfig } from "../../../domain/explore-indicators";
import { EuTrendCardView } from "./eu-trend-card-view/eu-trend-card-view";
import { CountriesTrendCardView } from "./countries-trend-card-view/countries-trend-card-view";

@Component({
  selector: 'app-indicator-card',
  templateUrl: './indicator-card.html',
  imports: [
    EuTrendCardView,
    CountriesTrendCardView
  ]
})
export class IndicatorCard {
  indicator = input.required<ExploreIndicatorConfig>();
  geographyScope = input.required<'all' | 'select'>();
  startYear = input.required<number>();
  endYear = input.required<number>();
  selectedCountryIds = input.required<Set<string>>();

  readonly mockScalarValue = 73;
  readonly mockScalarDelta = -2;

  readonly cardViewKind = computed<'eu-snapshot' | 'eu-trend' | 'countries-trend' | 'countries-snapshot'>(() => {
    const isEU = this.geographyScope() === 'all';
    const isSnapshot = this.startYear() === this.endYear();

    if (isEU && isSnapshot) return 'eu-snapshot';
    if (isEU && !isSnapshot) return 'eu-trend';
    if (!isEU && !isSnapshot) return 'countries-trend';
    return 'countries-snapshot';
  });
}


