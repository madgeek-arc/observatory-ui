import { Component, computed, inject, input } from "@angular/core";
import { FormatPercentPipe } from "../../../../shared/pipes/format-percent.pipe";
import * as Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import { CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { colors } from "../../../../domain/chart-color-palette";
import { formatCompactNumber, formatPercent, roundHalfUp } from "../../../../domain/format-indicator-value";
import { CardState } from "../../../../shared/card-state/card-state";

@Component({
  selector: 'app-stacked-bar-with-progress-card-view',
  templateUrl: './stacked-bar-with-progress-card-view.html',
  imports: [HighchartsChartModule, CardState, FormatPercentPipe]
})
export class StackedBarWithProgressCardView {
  private readonly customSearchService = inject(CustomSearchService);

  Highcharts: typeof Highcharts = Highcharts;

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();

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

  private readonly dimension = computed(() => this.response()?.dimensions.find(d => d !== 'period') ?? '');

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );
  /** Open access = every member the backend groups as OPEN_ACCESS (e.g. with + without
   *  licence); the 'OA' fallback covers members that have no group yet. */
  private readonly openAccessCodes = computed(() => new Set(
    (this.members() ?? [])
      .filter(member => member.group === 'OPEN_ACCESS' || member.code === 'OA')
      .map(member => member.code)
  ));

  readonly total = computed(() => {
    const response = this.response();
    if (!response) {
      return 0;
    }
    return response.data.reduce((sum, point) => sum + (typeof point.value === 'number' ? point.value : 0), 0);
  });

  readonly formattedTotal = computed(() => formatCompactNumber(this.total()));

  /** What the indicator counts, from the backend: "Publications" → "publications". */
  readonly unitLabel = computed(() => (this.response()?.metadata.label ?? '').toLowerCase());

  readonly segments = computed(() => {
    const response = this.response();
    const dimension = this.dimension();
    const total = this.total();
    if (!response || total === 0) {
      return [];
    }
    return response.data
      .filter(point => typeof point.value === 'number')
      .map((point, index) => {
        const value = point.value as number;
        const code = point.dimensions[dimension];
        return {
          code,
          label: this.labelByCode()[code] ?? code,
          value,
          percent: roundHalfUp((value / total) * 100),
          color: colors[index % colors.length],
          formattedValue: formatCompactNumber(value)
        };
      });
  });

  /** Share of all open-access segments together, from the raw values (not the rounded
   *  segment percents, so rounding errors don't add up). */
  readonly headlinePercent = computed(() => {
    const total = this.total();
    const openAccessCodes = this.openAccessCodes();
    const oaValue = this.segments()
      .filter(segment => openAccessCodes.has(segment.code))
      .reduce((sum, segment) => sum + segment.value, 0);
    return total > 0 ? roundHalfUp((oaValue / total) * 100) : 0;
  });

  /** One category, one stacked bar — each segment is its own series so it can carry
   *  its own fixed color (not auto-assigned by Highcharts). */
  readonly chartOptions = computed<Highcharts.Options | undefined>(() => {
    const segments = this.segments();
    if (segments.length === 0) {
      return undefined;
    }
    return {
      chart: { type: 'bar', height: 54 },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: [''], visible: false },
      yAxis: { min: 0, max: 100, visible: false, title: { text: undefined } },
      tooltip: { pointFormatter: function () { return `${this.series.name}: ${formatPercent(this.y ?? 0)}`; } },
      plotOptions: {
        bar: {
          stacking: 'normal',
          borderWidth: 0,
          pointWidth: 24,
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            formatter: function (): string | null {
              return (this.y ?? 0) >= 0 ? formatPercent(this.y ?? 0) : null;
            }
          }
        }
      },
      legend: { enabled: false },
      series: segments.map(segment => ({
        type: 'bar' as const,
        name: segment.label,
        data: [segment.percent],
        color: segment.color
      }))
    };
  });

  readonly isEmpty = computed(() => this.segments().length === 0);
}
