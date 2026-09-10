import { Component, computed, inject, input, signal } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { ACCESS_TYPE_LABELS, ACCESS_TYPES, CLASSIFICATION_LABELS, CLASSIFICATIONS } from "../../../../domain/oa-license-status";
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

  Highcharts: typeof Highcharts = Highcharts;
  readonly accessTypes = ACCESS_TYPES;
  readonly accessTypeLabels = ACCESS_TYPE_LABELS;
  readonly selectedAccessType = signal(ACCESS_TYPES[0]);

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

  /** value(accessType, classification, country, year) via one O(1)-lookup map, built
   *  once per response instead of re-scanning response.data for every lookup. */
  private readonly valueByKey = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const map = new Map<string, number>();
    for (const point of response.data) {
      const key = `${point.dimensions['oaLicenseStatus']}|${point.dimensions['classification']}|${point.dimensions['country']}|${point.dimensions['period']}`;
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
    if (!valueByKey || !years) {
      return undefined;
    }
    const accessType = this.selectedAccessType();

    return CLASSIFICATIONS.map(classification => ({
      classification,
      options: {
        chart: { type: 'line', height: 180 },
        title: { text: CLASSIFICATION_LABELS[classification], style: { fontSize: '12px', fontWeight: 'bold' } },
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
            const total = ACCESS_TYPES.reduce(
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
