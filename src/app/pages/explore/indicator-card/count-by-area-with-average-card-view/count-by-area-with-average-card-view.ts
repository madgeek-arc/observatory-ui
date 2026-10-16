import {Component, computed, inject, input} from '@angular/core';
import {
  CustomSearchService,
  dataOf, hasNumericValue,
  IndicatorPresetQueryRequest
} from "../../custom-search/services/custom-search.service";
import {CardState} from "../../../../shared/card-state/card-state";

/** One entry of the grid: the area's name, how many countries cover it and how many countries reported. */
interface Area {
  code: string;
  name: string;
  value: number;
  total: number | undefined;
}

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
  /** Nothing to show when the response holds no number at all, or when no country reported that year:
   *  the backend then answers with 0 of 0 for every area instead of leaving the values empty. */
  protected readonly isEmpty = computed(() => !hasNumericValue(this.response()) || this.reportingCountries() === 0);

  protected readonly totalAreas = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    return response.data.length;
  });

  protected readonly reportingCountries = computed(() => {
    const response = this.response();
    if (!response || response.data.length === 0) {
      return undefined;
    }
    return response.data[0].total;
  });

  protected readonly average = computed(() => {
    const response = this.response();
    const reportingCountries = this.reportingCountries();
    if (!response || !reportingCountries) {
      return undefined;
    }

    let sum = 0;
    for (const row of response.data) {
      if (typeof row.value === 'number') {
        sum = sum + row.value;
      }
    }

    return (sum / reportingCountries).toFixed(1);
  });

  /** The year the response is about. Every row carries it in its `period` dimension. */
  protected readonly year = computed(() => {
    const response = this.response();
    if (!response || response.data.length === 0) {
      return undefined;
    }
    return response.data[0].dimensions['period'];
  });

  /** "Monitored Areas Count" becomes "monitored areas": the word "Count" at the end is dropped. */
  protected readonly unitLabel = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    return response.metadata.label.replace(/\s*count$/i, '').toLowerCase();
  });

  /** The name of the breakdown dimension (the one that is not `period`), read from the response
   *  so nothing is hardcoded. '' means "not known yet" and the members request waits. */
  private readonly dimension = computed(() => {
    const response = this.response();
    if (!response) {
      return '';
    }
    for (const name of response.dimensions) {
      if (name !== 'period') {
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

  /** The grid: one entry per row that has a number (null means "no data", not 0), named with the backend's
   *  label for its code and sorted by how many countries cover the area. */
  protected readonly areas = computed<Area[]>(() => {
    const response = this.response();
    if (!response) {
      return [];
    }
    const dimension = this.dimension();
    const labelByCode = this.labelByCode();

    const list: Area[] = [];
    for (const row of response.data) {
      if (typeof row.value === 'number') {
        const code = row.dimensions[dimension];
        list.push({ code, name: labelByCode[code] ?? code, value: row.value, total: row.total });
      }
    }

    list.sort((a, b) => {
      if (a.value !== b.value) {
        return b.value - a.value;
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  });
}
