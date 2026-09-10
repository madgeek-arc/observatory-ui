import { Component, computed, inject, input, signal } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { resolveSelectedCountries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";
import { CustomSearchService, IndicatorPresetQueryRequest } from "../../custom-search/services/custom-search.service";
import { ACCESS_TYPE_LABELS, ACCESS_TYPES, CLASSIFICATION_LABELS, CLASSIFICATIONS } from "../../../../domain/oa-license-status";
import { LoadingPlaceholder } from "../../../../shared/loading-placeholder/loading-placeholder";

const DOC_TYPE_COLORS = [colors[0], colors[1], colors[2], colors[4]];

@Component({
  selector: 'app-selector-dot-plot-card-view',
  templateUrl: './selector-dot-plot-card-view.html',
  imports: [HighchartsChartModule, LoadingPlaceholder]
})
export class SelectorDotPlotCardView {
  private readonly customSearchService = inject(CustomSearchService);

  indicatorId = input.required<string>();

  Highcharts: typeof Highcharts = Highcharts;
  readonly accessTypes = ACCESS_TYPES;
  readonly accessTypeLabels = ACCESS_TYPE_LABELS;
  readonly selectedAccessType = signal(ACCESS_TYPES[0]);
  readonly docTypeLabels = CLASSIFICATIONS.map(c => CLASSIFICATION_LABELS[c]);
  readonly docTypeColors = DOC_TYPE_COLORS;

  readonly selectedCountries = computed(() =>
    resolveSelectedCountries(this.customSearchService.selectedCountryIds())
  );

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

  /** value(accessType, classification, country) via one O(1)-lookup map, built once
   *  per response instead of re-scanning response.data for every lookup. */
  private readonly valueByKey = computed(() => {
    const response = this.response();
    if (!response) {
      return undefined;
    }
    const map = new Map<string, number>();
    for (const point of response.data) {
      const key = `${point.dimensions['oaLicenseStatus']}|${point.dimensions['classification']}|${point.dimensions['country']}`;
      map.set(key, point.value as number);
    }
    return map;
  });

  /** One row per selected country: each document type's share of the currently
   *  selected access type, plus the min/max that drives the range printed on the right. */
  readonly countryRows = computed(() => {
    const valueByKey = this.valueByKey();
    if (!valueByKey) {
      return undefined;
    }
    const accessType = this.selectedAccessType();

    return this.selectedCountries().map(country => {
      const values = CLASSIFICATIONS.map(classification => {
        const total = ACCESS_TYPES.reduce(
          (sum, type) => sum + (valueByKey.get(`${type}|${classification}|${country.id}`) ?? 0), 0
        );
        const value = valueByKey.get(`${accessType}|${classification}|${country.id}`) ?? 0;
        return { label: CLASSIFICATION_LABELS[classification], value: total > 0 ? Math.round((value / total) * 100) : 0 };
      });
      const nums = values.map(v => v.value);
      return { id: country.id, name: country.name, values, min: Math.min(...nums), max: Math.max(...nums) };
    });
  });

  /** countryRows() plus a per-row Highcharts config — kept separate from countryRows
   *  so the plain data (used for the range label) stays independent of chart concerns. */
  readonly rows = computed(() => {
    const countryRows = this.countryRows();
    return countryRows?.map(row => ({ ...row, options: this.buildChartOptions(row.values) }));
  });

  readonly captionText = computed(() =>
    `Share of each output that is "${this.accessTypeLabels[this.selectedAccessType()]}" · ${this.customSearchService.startYear()} · percentage of publications`
  );

  selectAccessType(type: string) {
    this.selectedAccessType.set(type);
  }

  /** One country = one flat 0–100% scatter "row". No y-axis categories needed —
   *  every point sits at y=0. Every row's chart is identical: no axis labels are
   *  drawn by Highcharts at all (the shared 0/50/100 scale is plain HTML in the
   *  template) — that removes the need to guess how much extra space Highcharts
   *  reserves internally for label text, which is what made the last row's plot
   *  area shrink unpredictably before. */
  private buildChartOptions(values: { label: string; value: number }[]): Highcharts.Options {
    return {
      chart: {
        type: 'scatter',
        height: 32,
        spacing: [0, 4, 0, 4],
        events: {
          load(): void {
            const container = this.container as HTMLElement;
            container.style.overflow = 'visible';
            const svg = container.querySelector('svg');
            if (svg) {
              (svg as unknown as HTMLElement).style.overflow = 'visible';
            }
            const host = container.closest('highcharts-chart') as HTMLElement | null;
            if (host) {
              host.style.overflow = 'visible';
            }
          }
        }
      },
      colors: DOC_TYPE_COLORS,
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        min: 0,
        max: 100,
        tickLength: 0,
        lineWidth: 0,
        gridLineWidth: 0,
        labels: { enabled: false }
      },
      yAxis: {
        min: -1,
        max: 1,
        title: { text: undefined },
        labels: { enabled: false },
        lineWidth: 0,
        tickWidth: 0,
        gridLineWidth: 0,
        plotLines: [{ value: 0, width: 1, color: '#B8B8B8' }]
      },
      tooltip: {
        pointFormat: '{series.name}: {point.x}%',
        useHTML: true,
        hideDelay: 0
      },
      plotOptions: {
        scatter: {
          marker: { symbol: 'circle', radius: 7, lineWidth: 2, lineColor: '#FFFFFF' }
        }
      },
      legend: { enabled: false },
      series: values.map(v => ({
        type: 'scatter' as const,
        name: v.label,
        data: [{ x: v.value, y: 0 }]
      }))
    };
  }
}
