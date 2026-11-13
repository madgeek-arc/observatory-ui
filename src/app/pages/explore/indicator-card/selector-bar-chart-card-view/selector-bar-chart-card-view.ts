import { Component, computed, inject, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { SeriesOptionsType } from "highcharts";
import { CustomSearchService, dataOf, hasNumericValue, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { colors } from "../../../../domain/chart-color-palette";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";
import { CardState } from "../../../../shared/card-state/card-state";
import { renderLogo } from "../../../../shared/charts/highcharts-functions";
import { axisLabelFormatter, formatPercent } from "../../../../domain/format-indicator-value";

/**
 * Builds its own Highcharts options instead of using the shared <app-multi-chart>: that component
 * formats numbers with Highcharts' global settings (shared with the Explore pages), so Custom Search
 * could not apply its own number rules there without changing Explore too. The layout below copies
 * what <app-multi-chart> drew for this card (inverted bar chart, logo, legend, grid lines).
 */
@Component({
  selector: 'app-selector-bar-chart-card-view',
  templateUrl: './selector-bar-chart-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder, CardState]
})
export class SelectorBarChartCardView {
  private readonly customSearchService = inject(CustomSearchService);

  Highcharts: typeof Highcharts = Highcharts;

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  presetCodes = input<string[]>([]);

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);

  /** Areas shown on the x-axis — minus the ones paused in every year of the range (see fullyExcludedAreas). */
  private readonly categoryCodes = computed(() => {
    const preset = this.presetCodes();
    const codes = preset.length > 0 ? preset : (this.members()?.map(m => m.code) ?? []);
    const fullyExcluded = this.fullyExcludedAreas();
    return codes.filter(code => !fullyExcluded.has(code));
  });
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );
  readonly categories = computed(() =>
    this.categoryCodes().map(code => this.labelByCode()[code] ?? code)
  );

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);
  private readonly response = computed(() => dataOf(this.state()));

  /**
   * Backend exclusions (e.g. QUESTION_PAUSED) for this card's dimension, grouped as
   * member -> the years it is paused in.
   */
  private readonly pausedYearsByArea = computed(() => {
    const dimension = this.dimension();
    const pausedYears = new Map<string, Set<string>>();
    for (const exclusion of this.response()?.exclusions ?? []) {
      if (exclusion.dimension !== dimension) {
        continue;
      }
      const years = pausedYears.get(exclusion.member) ?? new Set<string>();
      years.add(exclusion.period);
      pausedYears.set(exclusion.member, years);
    }
    return pausedYears;
  });

  /**
   * Areas paused in EVERY year of the selected range — removed from the chart entirely.
   * Areas paused only in some years stay; their paused years are drawn as gaps (null) in chartSeries.
   * With a single-year range this matches the yes/no table: paused that year -> hidden.
   */
  private readonly fullyExcludedAreas = computed(() => {
    const yearCount = this.customSearchService.endYear() - this.customSearchService.startYear() + 1;
    return new Set(
      [...this.pausedYearsByArea()]
        .filter(([, years]) => years.size >= yearCount)
        .map(([member]) => member)
    );
  });

  private readonly years = computed(() => {
    const response = this.response();
    return response ? [...new Set(response.data.map(p => p.dimensions['period']))].sort((a, b) => a.localeCompare(b)) : [];
  });

  readonly chartSeries = computed<SeriesOptionsType[]>(() => {
    const response = this.response();
    const dimension = this.dimension();
    const codes = this.categoryCodes();
    const pausedYearsByArea = this.pausedYearsByArea();
    if (!response) {
      return [];
    }
    const valueOf = (year: string, code: string) =>
      response.data.find(point =>
        point.dimensions['period'] === year && point.dimensions[dimension] === code
      )?.value;

    return this.years().map((year, index) => ({
      type: 'column' as const,
      name: year,
      // Color by position: 1st year → colors[0], 2nd → colors[1], …, wrapping back to colors[0]
      // when the palette runs out. Set explicitly because chart.update() keeps advancing
      // Highcharts' internal color counter, so the palette alone drifts on every range change.
      color: colors[index % colors.length],
      data: codes.map(code => {
        // Paused that year → null, so Highcharts leaves a gap instead of a misleading 0% bar.
        if (pausedYearsByArea.get(code)?.has(year)) {
          return null;
        }
        const value = valueOf(year, code);
        return typeof value === 'number' ? value : 0;
      })
    }));
  });

  /** True when a visible area has at least one paused (gap) year — shows the footnote under the chart. */
  readonly hasPausedYears = computed(() => {
    const pausedYearsByArea = this.pausedYearsByArea();
    return this.categoryCodes().some(code => pausedYearsByArea.has(code));
  });

  readonly ready = computed(() => this.response() !== undefined && this.categoryCodes().length > 0);

  readonly chartOptions = computed<Highcharts.Options>(() => ({
    colors,
    chart: {
      type: 'bar',
      height: 600,
      spacingBottom: 50,
      events: {
        load: function () {
          renderLogo(this.renderer, this.chartWidth, this.chartHeight);
        }
      }
    },
    title: { text: undefined },
    credits: { enabled: false },
    exporting: { sourceWidth: 1000, sourceHeight: 600 },
    xAxis: { categories: this.categories(), gridLineWidth: 1, lineWidth: 0 },
    yAxis: {
      title: { text: undefined },
      gridLineWidth: 0,
      labels: { formatter: axisLabelFormatter('percentage') }
    },
    tooltip: {
      pointFormatter: function () {
        return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${formatPercent(this.y ?? 0)}</b><br/>`;
      }
    },
    plotOptions: {
      // The series are 'column' type; in a 'bar' (inverted) chart they draw horizontally.
      column: {
        pointWidth: 10,
        groupPadding: 0.1,
        pointPadding: 0.05,
        dataLabels: {
          enabled: true,
          formatter: function () {
            return this.y === null || this.y === undefined ? null : formatPercent(this.y);
          }
        }
      }
    },
    series: this.chartSeries()
  }));

  readonly isEmpty = computed(() => !hasNumericValue(this.response()));
}
