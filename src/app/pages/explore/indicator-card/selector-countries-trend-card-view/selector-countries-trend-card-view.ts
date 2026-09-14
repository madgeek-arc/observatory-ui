import { Component, computed, inject, input, signal } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

interface ChartPanel {
  classification: string;
  options: Highcharts.Options;
}

@Component({
  selector: 'app-selector-countries-trend-card-view',
  templateUrl: './selector-countries-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class SelectorCountriesTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);

  readonly accessTypes = computed(() => this.members()?.map(m => m.code) ?? []);
  readonly accessTypeLabels = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );

  /** undefined = "nothing picked yet"; effectiveAccessType() below fills in the first
   *  fetched access type once /members resolves, without needing an effect(). */
  readonly selectedAccessType = signal<string | undefined>(undefined);
  readonly effectiveAccessType = computed(() => this.selectedAccessType() ?? this.accessTypes()[0]);

  /** Selected countries, each given a stable color (by position) shared across
   *  every panel's lines and the legend below the panels. */
  readonly selectedCountries = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds()).map((country, index) => ({
      ...country,
      color: colors[index % colors.length]
    }))
  );

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  private readonly years = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(point => point.dimensions['period']))].sort() : undefined;
  });

  /** Document types actually present in the response, alphabetical — not from /members,
   *  since /members returns the whole universal vocabulary for this indicatorCode, not
   *  just the classifications this indicator's data actually uses. */
  private readonly classifications = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(p => p.dimensions['classification']))].sort() : [];
  });

  /** value(accessType, classification, country, year) via one O(1)-lookup map, built
   *  once per response instead of re-scanning response.data for every lookup. */
  private readonly valueByKey = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const dimension = this.dimension();
    const map = new Map<string, number>();
    for (const point of response.data) {
      const key = `${point.dimensions[dimension]}|${point.dimensions['classification']}|${point.dimensions['country']}|${point.dimensions['period']}`;
      map.set(key, point.value as number);
    }
    return map;
  });

  /** One mini chart per document type — each with one line per selected country,
   *  showing that country's share of the selected access type across the years. */
  readonly panels = computed<ChartPanel[] | undefined>(() => {
    const valueByKey = this.valueByKey();
    const years = this.years();
    const countries = this.selectedCountries();
    const accessTypes = this.accessTypes();
    if (!valueByKey || !years) {
      return undefined;
    }
    const accessType = this.effectiveAccessType();

    return this.classifications().map(classification => ({
      classification,
      options: {
        chart: { type: 'line', height: 180 },
        title: { text: classification, style: { fontSize: '12px', fontWeight: 'bold' } },
        credits: { enabled: false },
        exporting: { enabled: false },
        xAxis: { categories: years },
        yAxis: { min: 0, max: 100, title: { text: undefined } },
        tooltip: { pointFormat: '{series.name}: {point.y}%' },
        plotOptions: { line: { marker: { enabled: true, radius: 3, symbol: 'circle' } } },
        legend: { enabled: false },
        series: countries.map(country => ({
          type: 'line' as const,
          name: country.name,
          color: country.color,
          data: years.map(year => {
            const total = accessTypes.reduce(
              (sum, type) => sum + (valueByKey.get(`${type}|${classification}|${country.id}|${year}`) ?? 0), 0
            );
            const value = valueByKey.get(`${accessType}|${classification}|${country.id}|${year}`) ?? 0;
            return total > 0 ? Math.round((value / total) * 100) : 0;
          })
        }))
      }
    }));
  });

  selectAccessType(type: string) {
    this.selectedAccessType.set(type);
  }
}
