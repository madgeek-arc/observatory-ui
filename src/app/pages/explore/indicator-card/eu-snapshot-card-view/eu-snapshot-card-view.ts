import {Component, computed, inject, input} from "@angular/core";
import {CustomSearchService, IndicatorPresetQueryRequest} from "../../custom-search/services/custom-search.service";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {switchMap} from "rxjs/operators";
import {IndicatorFormat} from "../../../../domain/explore-indicators";
import {formatIndicatorValue} from "../../../../domain/format-indicator-value";

@Component({
  selector: 'app-eu-snapshot-card-view',
  templateUrl: './eu-snapshot-card-view.html',
  imports: []
})
export class EuSnapshotCardView {

  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  startYear = input.required<number>();
  format = input.required<IndicatorFormat>();

  private readonly queryParams = computed (() => ({
    id: this.indicatorId(),
    request: { countries: [], yearFrom: this.startYear(), yearTo: this.startYear(),
    seriesAggregations: []} as IndicatorPresetQueryRequest
  }));

  private readonly response = toSignal(
    toObservable(this.queryParams).pipe(switchMap(({id, request}) =>
    this.customSearchService.queryIndicator(id, request)))
  )

  readonly scalarValue = computed(() => this.response()?.data[0]?.value);

  readonly formattedValue = computed(() => {
    const value = this.scalarValue();
    return typeof value === 'number' ? formatIndicatorValue(value, this.format()) : undefined;
  });
}
