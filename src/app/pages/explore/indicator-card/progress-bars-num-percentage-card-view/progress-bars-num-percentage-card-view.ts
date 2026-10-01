import {Component, computed, inject, input} from '@angular/core';
import {CustomSearchService, IndicatorPresetQueryRequest} from "../../custom-search/services/custom-search.service";
import {IndicatorFormat} from "../../../../domain/explore-indicators";
import {resolveSelectedCountries} from "../../../../domain/countries";
import {formatCompactCurrency} from "../../../../domain/format-indicator-value";
import {LoadingPlaceholder} from "../../../../shared/loading-placeholder/loading-placeholder";
import {DecimalPipe} from "@angular/common";

@Component({
  selector: 'app-progress-bars-num-percentage-card-view',
  imports: [LoadingPlaceholder, DecimalPipe],
  templateUrl: './progress-bars-num-percentage-card-view.html',
})
export class ProgressBarsNumPercentageCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  format = input.required<IndicatorFormat>();

  readonly selectedCountries = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds()));

  private readonly queryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.startYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));

  private readonly response = this.customSearchService.queryIndicatorSignal(this.queryParams);

  private readonly euQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.customSearchService.startYear(),
      yearTo: this.customSearchService.startYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }))

  private readonly euResponse = this.customSearchService.queryIndicatorSignal(this.euQueryParams);

  readonly euTotal = computed(() =>
    (this.euResponse()?.data ?? [])
      .reduce((sum, p) => sum + (typeof p.value === 'number' ? p.value : 0), 0));

  /** One row per selected country, ranked by amount (countries without data last). */
  readonly rows = computed(() => {
    const response = this.response();
    if (!response) {
      return [];
    }
    const eu = this.euTotal();
    return this.selectedCountries()
      .map(country => {
        const point = response.data.find(p => p.dimensions['country'] === country.id);
        const raw = point?.value;
        const value = typeof raw === 'number' ? raw : null;
        const total = point?.total ?? null;

        let percent = 0;
        let formattedValue = 'N/A';
        if (this.format() === 'number') {
          // Count out of a per-row total
          if (value !== null && total !== null && total > 0) {
            percent = value / total * 100;
            formattedValue = `${value}/${total}`;
          }
        } else {
          // Currency: share of the all-countries (EU) total.
          if (value !== null) {
            percent = eu > 0 ? value / eu * 100 : 0;
            formattedValue = formatCompactCurrency(value);
          }
        }

        return {
          id: country.id,
          name: country.name,
          value,
          total,
          percent,
          formattedValue
        };
      })
      .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  });

  /** The summary row under the list — currency: the selected countries' sum vs the EU total;
   *  number: the average of the selected countries that have data (N/A rows excluded). */
  readonly totalRow = computed(() => {
    const rows = this.rows();

    if (this.format() === 'number') {
      const withData = rows.filter(row => row.value !== null && row.total !== null && row.total > 0);
      if (withData.length === 0) {
        return { label: 'Selected average', percent: 0, formattedValue: 'N/A' };
      }
      const avgValue = withData.reduce((sum, row) => sum + (row.value ?? 0), 0) / withData.length;
      const avgPercent = withData.reduce((sum, row) => sum + row.percent, 0) / withData.length;
      // Assumes every country shares the same total (e.g. 12 monitored areas).
      const total = withData[0].total;
      return {
        label: 'Selected average',
        percent: avgPercent,
        formattedValue: `${+avgValue.toFixed(1)}/${total}`
      };
    }

    const sum = rows.reduce((acc, row) => acc + (row.value ?? 0), 0);
    const eu = this.euTotal();
    return {
      label: 'Selected countries',
      percent: eu > 0 ? sum / eu * 100 : 0,
      formattedValue: formatCompactCurrency(sum)
    };
  });

  readonly ready = computed(() => this.response() !== undefined && this.euResponse() !== undefined);
}
