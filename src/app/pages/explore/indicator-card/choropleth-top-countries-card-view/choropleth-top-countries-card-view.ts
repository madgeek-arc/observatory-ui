import { Component, computed, inject, input } from "@angular/core";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { IndicatorFormat } from "../../../../domain/explore-indicators";
import { formatIfNumber } from "../../../../domain/format-indicator-value";
import { resolveCountryName } from "../../../../domain/countries";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

interface RankedCountry {
  id: string;
  name: string;
  value: number;
  barWidth: number;
}

@Component({
  selector: 'app-choropleth-top-countries-card-view',
  templateUrl: './choropleth-top-countries-card-view.html',
  imports: [ChartsModule, LoadingPlaceholder]
})
export class ChoroplethTopCountriesCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  format = input.required<IndicatorFormat>();

  readonly year = computed(() => this.customSearchService.startYear());
  readonly topBarColor = colors[0];

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.startYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  private readonly countryValues = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    return response.data
      .filter(point => typeof point.value === 'number')
      .map(point => ({ id: point.dimensions['country'], value: point.value as number }));
  });

  readonly formattedTotal = computed(() => {
    const values = this.countryValues();
    if (!values) {
      return undefined;
    }
    const total = values.reduce((sum, c) => sum + c.value, 0);
    return formatIfNumber(total, this.format());
  });

  /** [countryCode, value] pairs for the choropleth — lowercased, since
   *  HighchartsColorAxisMapComponent matches them against the map's lowercase iso-a2 codes. */
  readonly mapData = computed<[string, number][] | undefined>(() =>
    this.countryValues()?.map(c => [c.id.toLowerCase(), c.value])
  );

  /** Scales the gradient to the data actually present, instead of the shared map
   *  component's hardcoded default max of 25. */
  readonly colorAxis = computed(() => {
    const values = this.countryValues()?.map(c => c.value) ?? [];
    const max = values.length > 0 ? Math.max(...values) : 1;
    return { min: 0, max, stops: [[0, '#F1EEF6'], [1, colors[0]]] as [number, string][] };
  });

  readonly topCountries = computed<RankedCountry[] | undefined>(() => {
    const values = this.countryValues();
    if (!values) {
      return undefined;
    }
    const top5 = [...values].sort((a, b) => b.value - a.value).slice(0, 5);
    const maxValue = top5[0]?.value ?? 0;
    return top5.map(c => ({
      id: c.id,
      name: resolveCountryName(c.id),
      value: c.value,
      barWidth: maxValue > 0 ? Math.round((c.value / maxValue) * 100) : 0
    }));
  });
}
