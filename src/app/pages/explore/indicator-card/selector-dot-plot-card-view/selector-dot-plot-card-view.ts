import { Component, computed, input, signal } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { countries } from "../../../../domain/countries";
import { colors } from "../../../../domain/chart-color-palette";

const ACCESS_TYPES = ['Open Access with licence', 'Open Access without licence', 'Embargo', 'Restricted', 'Closed Access'];
const DOC_TYPE_COLORS = [colors[0], colors[1], colors[2], colors[4]];

interface DocumentTypeBreakdown {
  label: string;

  shares: number[];
}

/** Same base numbers as the indicator's other views — see stacked-column-view.ts. */
const MOCK_BREAKDOWN: DocumentTypeBreakdown[] = [
  { label: 'Article', shares: [58, 15, 1, 1, 25] },
  { label: 'Conference', shares: [41, 14, 3, 3, 39] },
  { label: 'Book chapter', shares: [18, 9, 9, 1, 63] },
  { label: 'Book', shares: [36, 19, 3, 6, 36] },
];

@Component({
  selector: 'app-selector-dot-plot-card-view',
  templateUrl: './selector-dot-plot-card-view.html',
  imports: [HighchartsChartModule]
})
export class SelectorDotPlotCardView {
  startYear = input.required<number>();
  selectedCountryIds = input.required<Set<string>>();

  Highcharts: typeof Highcharts = Highcharts;
  readonly accessTypes = ACCESS_TYPES;
  readonly selectedAccessType = signal(ACCESS_TYPES[0]);
  readonly docTypeLabels = MOCK_BREAKDOWN.map(d => d.label);
  readonly docTypeColors = DOC_TYPE_COLORS;

  readonly selectedCountries = computed(() =>
    [...this.selectedCountryIds()]
      .map(id => countries.find(c => c.id === id))
      .filter((c): c is { id: string; name: string } => !!c)
  );

  /** One row per selected country: each document type's share for the currently
   *  selected access type, plus the min/max that drives the range printed on the right. */
  readonly countryRows = computed(() => {
    const accessIdx = ACCESS_TYPES.indexOf(this.selectedAccessType());
    return this.selectedCountries().map((country, countryIdx) => {
      const values = MOCK_BREAKDOWN.map((docType, docIdx) => ({
        label: docType.label,
        value: this.mockValue(countryIdx, docIdx, accessIdx)
      }));
      const nums = values.map(v => v.value);
      return {
        id: country.id,
        name: country.name,
        values,
        min: Math.min(...nums),
        max: Math.max(...nums)
      };
    });
  });

  /** countryRows() plus a per-row Highcharts config — kept separate from countryRows
   *  so the plain data (used for the range label) stays independent of chart concerns.
   *  Every row's chart is now identical (see buildChartOptions) — the shared 0/50/100
   *  scale is a plain HTML row in the template, not drawn by any one chart's axis. */
  readonly rows = computed(() =>
    this.countryRows().map(row => ({ ...row, options: this.buildChartOptions(row.values) }))
  );

  readonly captionText = computed(() =>
    `Share of each output that is "${this.selectedAccessType()}" · ${this.startYear()} · percentage of publications`
  );

  selectAccessType(type: string) {
    this.selectedAccessType.set(type);
  }

  /** Deterministic per-country variation on top of the shared mock breakdown. */
  private mockValue(countryIdx: number, docIdx: number, accessIdx: number): number {
    const base = MOCK_BREAKDOWN[docIdx].shares[accessIdx];
    const jitter = ((countryIdx + 1) * (docIdx + 2) * (accessIdx + 1)) % 15 - 7;
    return Math.min(100, Math.max(0, base + jitter));
  }

  /** One country = one flat 0–100% scatter "row". No y-axis categories needed —
   *  every point sits at y=0. Every row's chart is now identical: no axis labels are
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
          // Three nested elements clip their content by default once our 46px-tall
          // tooltip extends past this 32px-tall chart: the <svg> itself (browser default
          // for SVG), Highcharts' own .highcharts-container div, and the <highcharts-chart>
          // host element the Angular wrapper renders as. All three need opting out.
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
        // Disabled piece by piece instead of `visible: false` — that blanket flag
        // was also swallowing the plotLine below, not just the axis chrome.
        labels: { enabled: false },
        lineWidth: 0,
        tickWidth: 0,
        gridLineWidth: 0,
        // the actual visible "track" — drawn exactly at y=0, where every point sits,
        // instead of relying on xAxis's own line (which renders at yAxis.min, not at 0).
        // No zIndex — Highcharts paints plotLines below series by default, which is what
        // lets the dots fully cover the line where they overlap it.
        plotLines: [{ value: 0, width: 1, color: '#B8B8B8' }]
      },
      tooltip: {
        pointFormat: '{series.name}: {point.x}%',
        // The chart itself is only 32px tall. By default the tooltip is SVG content
        // drawn inside that same tiny canvas, so it gets clipped. useHTML draws it as
        // a normal floating <div> instead, escaping the SVG's own bounds.
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
