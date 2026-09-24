import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { isPositiveStatus } from "../../../../domain/policy-status";
import { colors } from "../../../../domain/chart-color-palette";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-coverage-trend-card-view',
  templateUrl: './coverage-trend-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class CoverageTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  presetCodes = input<string[]>([]);

  Highcharts: typeof Highcharts = Highcharts;

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  /** /members returns this indicatorCode's whole shared vocabulary across every preset
   *  that reuses it, not just this one's areas — presetCodes (when given) narrows to the
   *  real set, same fix YearAdoptedTableCardView already needed for the same reason. */
  private readonly areas = computed(() => {
    const preset = this.presetCodes();
    return preset.length > 0 ? preset : (this.members()?.map(m => m.code) ?? []);
  });

  /** One count of "areas with a policy" per country per year — the Y-axis max is this
   *  indicator's real area count, not a hardcoded 12, so other indicators reusing this
   *  renderStyle (e.g. nm-1) scale correctly. */
  readonly totalAreas = computed(() => this.areas().length);

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

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const response = this.response();
    const dimension = this.dimension();
    const years = this.years();
    const areas = this.areas();
    if (!response || !years) {
      return undefined;
    }
    const unit = response.metadata.unit;

    return {
      chart: { type: 'line', height: 260 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: years, title: { text: 'Year' } },
      yAxis: {
        min: 0,
        max: this.totalAreas(),
        title: { text: 'Areas with a policy in place' }
      },
      tooltip: { pointFormat: '{series.name}: {point.y}' },
      plotOptions: {
        line: { marker: { enabled: true, radius: 4, symbol: 'circle' } }
      },
      legend: { enabled: true },
      series: this.selectedCountries().map(country => ({
        type: 'line' as const,
        name: country.name,
        color: country.color,
        data: years.map(year =>
          areas.filter(areaCode =>
            response.data.some(point =>
              point.dimensions['country'] === country.id &&
              point.dimensions[dimension] === areaCode &&
              point.dimensions['period'] === year &&
              isPositiveStatus(point.value, unit)
            )
          ).length
        )
      }))
    };
  });

  readonly ready = computed(() => this.response() !== undefined);
}
