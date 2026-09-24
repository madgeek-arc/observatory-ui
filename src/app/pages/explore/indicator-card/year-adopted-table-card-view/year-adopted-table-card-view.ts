import { Component, computed, inject, input } from "@angular/core";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { isPositiveStatus } from "../../../../domain/policy-status";
import { colors } from "../../../../domain/chart-color-palette";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

interface YearAdoptedCell {
  year: string | undefined;
  background: string;
  textColor: string | undefined;
}

@Component({
  selector: 'app-year-adopted-table-card-view',
  templateUrl: './year-adopted-table-card-view.html',
  imports: [LoadingPlaceholder]
})
export class YearAdoptedTableCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();
  indicatorCode = input.required<string>();
  dimension = input.required<string>();
  presetCodes = input<string[]>([]);

  readonly colorEarly = colors[0];
  readonly colorMid = '#66B7BE';
  readonly colorLatest = '#B2DBDE';
  readonly colorNone = '#eef1f3';

  private readonly membersParams = computed(() => ({
    indicatorCode: this.indicatorCode(),
    dimension: this.dimension()
  }));
  private readonly members = this.customSearchService.dimensionMembersSignal(this.membersParams);

  private readonly categoryCodes = computed(() => {
    const preset = this.presetCodes();
    return preset.length > 0 ? preset : (this.members()?.map(m => m.code) ?? []);
  });
  private readonly labelByCode = computed(() =>
    Object.fromEntries((this.members() ?? []).map(m => [m.code, m.label]))
  );
  private readonly areas = computed(() =>
    this.categoryCodes().map(code => ({ code, label: this.labelByCode()[code] ?? code }))
  );

  readonly countries = computed(() => resolveSelectedCountries(this.customSearchService.selectedCountryIds()));

  readonly startYear = computed(() => this.customSearchService.startYear());
  readonly endYear = computed(() => this.customSearchService.endYear());

  /** Per selected country, full selected year range — needed to find the first period
   *  each country+area pair turns positive, not just its status at endYear. */
  private readonly countriesQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [...this.customSearchService.selectedCountryIds()],
      yearFrom: this.startYear(),
      yearTo: this.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  private readonly countriesResponse = this.customSearchService.queryIndicatorSignal(this.countriesQueryParams);

  /** ALL_COUNTRIES, endYear only — drives the EU reference column (a plain % snapshot,
   *  same as SelectorYesNoTableCardView, not a "year adopted" computation). */
  private readonly euQueryParams = computed(() => ({
    id: this.indicatorId(),
    request: {
      countries: [],
      yearFrom: this.endYear(),
      yearTo: this.endYear(),
      seriesAggregations: []
    } as IndicatorPresetQueryRequest
  }));
  private readonly euResponse = this.customSearchService.queryIndicatorSignal(this.euQueryParams);

  readonly rows = computed(() => {
    const countriesResponse = this.countriesResponse();
    const euResponse = this.euResponse();
    const dimension = this.dimension();
    const startYear = String(this.startYear());
    const endYear = String(this.endYear());
    if (!countriesResponse || !euResponse) {
      return [];
    }
    const unit = countriesResponse.metadata.unit;

    return this.areas().map(area => ({
      label: area.label,
      cells: this.countries().map((country): YearAdoptedCell => {
        const points = countriesResponse.data
          .filter(point =>
            point.dimensions['country'] === country.id && point.dimensions[dimension] === area.code
          )
          .sort((a, b) => a.dimensions['period'].localeCompare(b.dimensions['period']));

        const adopted = points.find(point => isPositiveStatus(point.value, unit));
        if (!adopted) {
          return { year: undefined, background: this.colorNone, textColor: undefined };
        }
        const year = adopted.dimensions['period'];
        if (year === startYear) {
          return { year, background: this.colorEarly, textColor: '#FFFFFF' };
        }
        if (year === endYear) {
          return { year, background: this.colorLatest, textColor: this.colorEarly };
        }
        return { year, background: this.colorMid, textColor: '#FFFFFF' };
      }),
      euValue: euResponse.data.find(point => point.dimensions[dimension] === area.code)?.value
    }));
  });

  readonly ready = computed(() => this.countriesResponse() !== undefined && this.euResponse() !== undefined);
}
