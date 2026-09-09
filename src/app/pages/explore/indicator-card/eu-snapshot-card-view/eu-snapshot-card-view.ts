import {Component, computed, inject, input} from "@angular/core";
import {CustomSearchService, IndicatorPresetQueryRequest} from "../../custom-search/services/custom-search.service";
import {IndicatorFormat} from "../../../../domain/explore-indicators";
import {formatIfNumber} from "../../../../domain/format-indicator-value";
import {LoadingPlaceholder} from "../../../../shared/loading-placeholder/loading-placeholder";

@Component({
  selector: 'app-eu-snapshot-card-view',
  templateUrl: './eu-snapshot-card-view.html',
  imports: [LoadingPlaceholder]
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

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  readonly scalarValue = computed(() => this.response()?.data[0]?.value);

  readonly formattedValue = computed(() => formatIfNumber(this.scalarValue(), this.format()));
}
