import {Component, computed, inject, input} from "@angular/core";
import {CustomSearchService, dataOf, IndicatorPresetQueryRequest} from "../../custom-search/services/custom-search.service";
import {IndicatorFormat} from "../../../../domain/explore-indicators";
import {formatIfNumber} from "../../../../domain/format-indicator-value";
import {CardState} from "../../../../shared/card-state/card-state";

@Component({
  selector: 'app-eu-snapshot-card-view',
  templateUrl: './eu-snapshot-card-view.html',
  imports: [CardState]
})
export class EuSnapshotCardView {

  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  format = input.required<IndicatorFormat>();

  private readonly queryParams = computed (() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.startYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  readonly state = this.customSearchService.queryIndicatorState(this.queryParams);

  private readonly response = computed(() => dataOf(this.state()));

  readonly scalarValue = computed(() => this.response()?.data[0]?.value);

  readonly formattedValue = computed(() => formatIfNumber(this.scalarValue(), this.format()));

  /** No data, a null value or a non-numeric value — nothing to show as a number. */
  readonly isEmpty = computed(() => this.formattedValue() === undefined);
}
