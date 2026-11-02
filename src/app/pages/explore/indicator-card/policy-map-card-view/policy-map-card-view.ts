import {Component, computed, inject, input, linkedSignal} from "@angular/core";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { CategorizedAreaData, Series } from "../../../../domain/categorizedAreaData";
import { CustomSearchService, dataOf, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { CardState } from "../../../../shared/card-state/card-state";
import { colorForStatus, isAwaitingData, isPositiveStatus, mapHeadlineFor, trendBadge } from "../../../../domain/policy-status";

/** Legend order */
const LEGEND_ORDER = [
  'Mandatory policy',
  'Policy but not mandatory',
  'Has national monitoring',
  'No policy',
  'Does not have national monitoring',
  'Awaiting data',
  'N/A'
];

interface StatusSegment {
  label: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-policy-map-card-view',
  templateUrl: './policy-map-card-view.html',
  imports: [ChartsModule, CardState]
})
export class PolicyMapCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  showChangeCount = input(false);

  years = computed(() => {
    const start = this.customSearchService.startYear();
    const end = this.customSearchService.endYear();
    return Array.from({length: end - start + 1}, (_, index) => start + index);
  });

  readonly selectedYear = linkedSignal({
    source: this.years,
    computation: years => years[years.length - 1]
  });

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

  /** The range response holds every year — keep only the points of one of them. */
  private pointsOf(year: number) {
    return (this.response()?.data ?? [])
      .filter(point => point.dimensions['period'] === String(year));
  }

  /** Only the year chosen in the pills. */
  private readonly selectedYearData = computed(() => this.pointsOf(this.selectedYear()));

  readonly mapData = computed<CategorizedAreaData | undefined>(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }

    const groups = new Map<string, string[]>(LEGEND_ORDER.map(status => [status, []]));
    for (const point of this.selectedYearData()) {
      const rawValue = String(point.value);
      const countryCode = point.dimensions['country'];
      if (!groups.has(rawValue)) {
        groups.set(rawValue, []);
      }
      groups.get(rawValue)!.push(countryCode);
    }

    const data = new CategorizedAreaData();
    data.series = [...groups.entries()]
      .filter(([, countryCodes]) => countryCodes.length > 0)
      .map(([rawValue, countryCodes], index) => {
        const series = new Series(rawValue, index === 0);
        series.showInLegend = true;
        series.color = colorForStatus(rawValue);
        series.data = countryCodes.map(code => ({ code }));
        return series;
      });
    return data;
  });

  readonly totalCount = computed(() => this.selectedYearData().length);

  readonly statusSummary = computed<StatusSegment[]>(() =>
    (this.mapData()?.series ?? []).map(series => ({
      label: series.name,
      count: series.data.length,
      color: series.color
    }))
  );

  /** Countries with a positive status (any policy / has monitoring) in the given year. */
  private countPositive(year: number): number {
    return this.pointsOf(year)
      .filter(point => point.value !== null && isPositiveStatus(point.value))
      .length;
  }

  /** A year has data once at least one country has a real answer — while every country is
   *  still "N/A" / "Awaiting data", the survey simply hasn't been collected for it yet. */
  private hasData(year: number): boolean {
    return this.pointsOf(year)
      .some(point => point.value !== null && !isAwaitingData(point.value));
  }

  /** Where "+N since …" starts counting: the first year of the range that has answers. */
  private readonly baselineYear = computed(() => this.years().find(year => this.hasData(year)));

  /** "10 of 36 countries have a policy" — positive countries in the year shown on the map.
   *  Hidden while that year has no answers yet, instead of claiming "0 of 36". */
  readonly positiveSummary = computed(() => {
    const indicatorCode = this.response()?.metadata.indicatorCode;
    const headline = indicatorCode ? mapHeadlineFor(indicatorCode) : undefined;
    if (!headline || !this.hasData(this.selectedYear())) {
      return undefined;
    }
    return {
      count: this.countPositive(this.selectedYear()),
      total: this.totalCount(),
      label: headline.changeText
    };
  });

  /** "+4 since 2022" chip — net change between the baseline year and the year shown on the
   *  map; follows the year pills, hidden on the baseline year itself. Only for views that
   *  ask for the change count (MAP_WITH_CHANGE_COUNT). */
  readonly changeSinceStart = computed(() => {
    const baselineYear = this.baselineYear();
    const selectedYear = this.selectedYear();
    if (!this.showChangeCount() || !this.positiveSummary()
        || baselineYear === undefined || selectedYear <= baselineYear) {
      return undefined;
    }
    return trendBadge(this.countPositive(selectedYear) - this.countPositive(baselineYear), baselineYear);
  });

  readonly isEmpty = computed(() => this.selectedYearData().length === 0);

  selectYear(year: number) {
    this.selectedYear.set(year);
  }

}
