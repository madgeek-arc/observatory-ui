import { Component, computed, inject, input, signal } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { CustomSearchService, dataOf, hasNumericValue, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { CardState } from "../../../../shared/card-state/card-state";
import { formatCompactCurrency } from "../../../../domain/format-indicator-value";

@Component({
  selector: 'app-tabbed-countries-trend-card-view',
  templateUrl: './tabbed-countries-trend-card-view.html',
  imports: [HighchartsChartModule, CardState]
})
export class TabbedCountriesTrendCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  /** The selector's display name from the preset (e.g. "Open Science Area") — the label in front of the chips. */
  dimensionLabel = input<string>('');

  Highcharts: typeof Highcharts = Highcharts;

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);
  private readonly response = computed(() => dataOf(this.state()));

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );

  private readonly years = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(point => point.dimensions['period']))].sort() : [];
  });

  /** The chips: every category in the response, in the order it first appears. The response
   *  already holds all of them, so picking one only filters rows — no new request. */
  readonly areas = computed(() => {
    const response = this.response();
    const dimension = this.dimension();
    const codes = response ? [...new Set(response.data.map(point => point.dimensions[dimension]))] : [];
    return codes.map(code => ({ code, label: this.labelByCode()[code] ?? code }));
  });

  private readonly selectedCode = signal<string | undefined>(undefined);
  /** The chosen category, or the first one while nothing valid is chosen — same fallback
   *  IndicatorCard uses for effectiveRenderStyle. */
  readonly activeCode = computed(() => {
    const areas = this.areas();
    const selected = this.selectedCode();
    return areas.some(area => area.code === selected) ? selected : areas[0]?.code;
  });

  selectArea(code: string) {
    this.selectedCode.set(code);
  }

  /** Selected countries, each given a stable color (by position) — same
   *  colors[index % colors.length] convention every other per-country chart uses. */
  private readonly selectedCountries = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds()).map((country, index) => ({
      ...country,
      color: colors[index % colors.length]
    }))
  );

  /** One entry per selected country for the active area: its value in every year (null = no data)
   *  and the latest one. The chart and the legend both read this, so they can't disagree. */
  readonly countrySeries = computed(() => {
    const response = this.response();
    if (!response) {
      return [];
    }
    const years = this.years();
    const dimension = this.dimension();
    const activeCode = this.activeCode();
    const activeRows = response.data.filter(point => point.dimensions[dimension] === activeCode);

    return this.selectedCountries().map(country => {
      const values = years.map(year => {
        const point = activeRows.find(p =>
          p.dimensions['country'] === country.id && p.dimensions['period'] === year
        );
        return typeof point?.value === 'number' ? point.value : null;
      });
      let latestIndex = -1;
      values.forEach((value, index) => {
        if (value !== null) {
          latestIndex = index;
        }
      });
      const latest = latestIndex === -1 ? null : values[latestIndex];
      return {
        ...country,
        values,
        latestIndex,
        formattedLatest: latest === null ? '–' : formatCompactCurrency(latest)
      };
    });
  });

  readonly caption = computed(() => {
    const metric = this.response()?.metadata.label.toLowerCase();
    const years = this.years();
    const area = this.areas().find(a => a.code === this.activeCode())?.label;
    if (!metric || !area || years.length === 0) {
      return undefined;
    }
    const count = this.selectedCountries().length;
    const countries = count === 1 ? '1 country' : `${count} countries`;
    return `${countries} · ${years[0]}–${years[years.length - 1]} · ${metric} in ${area}, one line per country`;
  });

  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    if (!this.response()) {
      return undefined;
    }
    return {
      chart: { type: 'line', height: 260 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: this.years() },
      yAxis: {
        min: 0,
        title: { text: undefined },
        labels: {
          formatter: function () {
            const value = Number(this.value);
            return value === 0 ? '0' : formatCompactCurrency(value);
          }
        }
      },
      tooltip: {
        pointFormatter: function () {
          return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${formatCompactCurrency(this.y ?? 0)}</b><br/>`;
        }
      },
      plotOptions: { line: { marker: { enabled: false, radius: 4, symbol: 'circle' } } },
      legend: { enabled: false },
      series: this.countrySeries().map(country => ({
        type: 'line' as const,
        name: country.name,
        color: country.color,
        // Every point is a plain number (inheriting the series' disabled marker) except the latest
        // one, which overrides just its own marker — so only the end of the line gets a dot.
        data: country.values.map((value, index) =>
          index === country.latestIndex ? { y: value, marker: { enabled: true } } : value
        )
      }))
    };
  });

  readonly isEmpty = computed(() => !hasNumericValue(this.response()));
}
