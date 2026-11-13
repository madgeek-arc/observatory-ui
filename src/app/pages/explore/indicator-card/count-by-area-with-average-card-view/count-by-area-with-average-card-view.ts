import {Component, computed, inject, input} from '@angular/core';
import {
  CustomSearchService,
  dataOf,
  IndicatorPresetQueryRequest
} from "../../custom-search/services/custom-search.service";
import {CardState} from "../../../../shared/card-state/card-state";
import {statusCategory} from "../../../../domain/policy-status";
import {roundHalfUp} from "../../../../domain/format-indicator-value";
import UIkit from "uikit";
import data = UIkit.data;

/** One entry of the grid: the area's name, how many countries cover it and how many countries reported. */
interface Area {
  code: string;
  name: string;
  value: number;
  total: number | undefined;
}

/** A country with this many YES areas or more counts as covering many areas. */
const MANY_AREAS = 9;
/** A country with this many YES areas or fewer counts as covering few areas. */
const FEW_AREAS = 2;

/** The verb before "9 areas or more", per preset. A preset not listed here gets the neutral "cover". */
const AREA_VERBS: Record<string, string> = {
  'oa.monitored_areas_count': 'monitor',
  'oa.policy_areas_count': 'have policies in',
};

@Component({
  selector: 'app-count-by-area-with-average-card-view',
  imports: [
    CardState
  ],
  templateUrl: './count-by-area-with-average-card-view.html',
})
export class CountByAreaWithAverageCardView {
  private readonly customSearchService = inject(CustomSearchService);

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
  /** Nothing to show when the response has no rows, or when no country answered that year. */
  protected readonly isEmpty = computed(() => (this.response()?.data.length ?? 0) === 0 || this.reportingCountries() === 0);

  /** Rows that hold an answer (YES/NO). AWAITING_DATA and null mean the country hasn't answered that area yet. */
  private readonly answeredRows = computed(() =>
    (this.response()?.data ?? []).filter(row => statusCategory(row.value) !== 'awaiting')
  );

  /** How many areas each country answered YES to.  */
  private readonly yesAreasByCountry = computed(() => {
    const counts = new Map<string, number>();
    for (const row of this.response()?.data ?? []) {
      const country = row.dimensions['country'];
      const yes = statusCategory(row.value) === 'positive' ? 1 : 0;
      counts.set(country, (counts.get(country) ?? 0) + yes);
    }
    return counts;
  });

  /** Areas present in the response: a paused area is left out by the backend, so this can be below the usual count. */
  protected readonly totalAreas = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const dimension = this.dimension();
    return new Set(response.data.map(row => row.dimensions[dimension])).size;
  });

  /** Every country in the response: the backend only sends countries that validated their answers. */
  protected readonly reportingCountries = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    return new Set(response.data.map(row => row.dimensions['country'])).size;
  });

  protected readonly manyAreas = MANY_AREAS;
  protected readonly fewAreas = FEW_AREAS;
  protected readonly areaVerb = computed(() => AREA_VERBS[this.indicatorCode()] ?? 'cover');

  /** Countries that answered YES to MANY_AREAS areas or more. */
  protected readonly countriesWithManyAreas = computed(() =>
    [...this.yesAreasByCountry().values()].filter(count => count >= MANY_AREAS).length
  );

  /** Countries that answered YES to FEW_AREAS areas or fewer, including those with none. */
  protected readonly countriesWithFewAreas = computed(() =>
    [...this.yesAreasByCountry().values()].filter(count => count <= FEW_AREAS).length
  );

  protected readonly average = computed(() => {
    const reportingCountries = this.reportingCountries();
    if (!reportingCountries) {
      return undefined;
    }
    const yesCount = this.answeredRows().filter(row => statusCategory(row.value) === 'positive').length;
    return String(roundHalfUp(yesCount / reportingCountries));
  });

  /** The year the response is about. Every row carries it in its `period` dimension. */
  protected readonly year = computed(() => {
    const response = this.response();
    if (!response || response.data.length === 0) {
      return undefined;
    }
    return response.data[0].dimensions['period'];
  });

  /** The name of the breakdown dimension (the one that is neither `period` nor `country`), read from the
   *  response so nothing is hardcoded. '' means "not known yet" and the members request waits. */
  private readonly dimension = computed(() => {
    const response = this.response();
    if (!response) {
      return '';
    }
    for (const name of response.dimensions) {
      if (name !== 'period' && name !== 'country') {
        return name;
      }
    }
    return '';
  });

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);
  /** { OPEN_DATA_MONITORING_INITIATIVE: "National Monitoring on Open Data", ... } */
  private readonly labelByCode = computed(() => {
    const labels: Record<string, string> = {};
    const members = this.members();
    if (members) {
      for (const member of members) {
        labels[member.code] = member.label;
      }
    }
    return labels;
  });

  /** The grid: one entry per area — how many countries answered YES out of how many answered at all —
   *  named with the backend's label for its code and sorted by how many countries cover the area. */
  protected readonly areas = computed<Area[]>(() => {
    const dimension = this.dimension();
    const labelByCode = this.labelByCode();

    const byCode = new Map<string, Area>();
    for (const row of this.answeredRows()) {
      const code = row.dimensions[dimension];
      const area = byCode.get(code) ?? { code, name: labelByCode[code] ?? code, value: 0, total: 0 };
      area.total = (area.total ?? 0) + 1;
      if (statusCategory(row.value) === 'positive') {
        area.value++;
      }
      byCode.set(code, area);
    }
    const list = [...byCode.values()];

    list.sort((a, b) => {
      if (a.value !== b.value) {
        return b.value - a.value;
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  });
}
