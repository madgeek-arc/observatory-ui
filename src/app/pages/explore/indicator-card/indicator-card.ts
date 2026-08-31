import { Component, computed, input, output } from "@angular/core";
import { CountryScope, ExploreIndicatorConfig, RenderStyle, TimeScope } from "../../../domain/explore-indicators";
import { EuSnapshotCardView } from "./eu-snapshot-card-view/eu-snapshot-card-view";
import { EuTrendCardView } from "./eu-trend-card-view/eu-trend-card-view";
import { CountriesTrendCardView } from "./countries-trend-card-view/countries-trend-card-view";
import { CountriesSnapshotCardView } from "./countries-snapshot-card-view/countries-snapshot-card-view";
import { PolicyMapCardView } from "./policy-map-card-view/policy-map-card-view";
import { PolicyCountriesCardView } from "./policy-countries-card-view/policy-countries-card-view";

type CardViewKind = 'eu-snapshot' | 'eu-trend' | 'countries-trend' | 'countries-snapshot' | 'policy-map' | 'policy-countries';

const RENDER_STYLE_TO_VIEW: Partial<Record<RenderStyle, CardViewKind>> = {
  SCALAR: 'eu-snapshot',
  LINE_CHART: 'eu-trend',
  PROGRESS_BARS: 'countries-snapshot',
  MULTI_SERIES_LINE_CHART: 'countries-trend',
  YES_NO: 'policy-countries',
  YES_NO_TIMELINE: 'policy-countries',
  MAP: 'policy-map',
  MAP_WITH_CHANGE_COUNT: 'policy-map',
};

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

  readonly cardViewKind = computed<CardViewKind | undefined>(() => {
    const countryScope: CountryScope = this.geographyScope() === 'all' ? 'ALL_COUNTRIES' : 'SELECTED_COUNTRIES';
    const timeScope: TimeScope = this.startYear() === this.endYear() ? 'SINGLE_YEAR' : 'TIME_RANGE';

    const view = this.indicator().views.find(v => v.countryScope === countryScope && v.timeScope === timeScope);
    return view ? RENDER_STYLE_TO_VIEW[view.renderStyle] : undefined;
  });
}
