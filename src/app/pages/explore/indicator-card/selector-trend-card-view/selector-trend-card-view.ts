import { Component, computed, input, signal } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";

/** Access-type breakdown categories. Order matches the chart-color-palette so each
 *  category's pill/legend swatch is its actual chart color. */
const ACCESS_TYPES = ['Open Access with licence', 'Open Access without licence', 'Embargo', 'Restricted', 'Closed Access'];

interface DocumentTypeBreakdown {
  label: string;
  /** Share of each entry in ACCESS_TYPES, same order, summing to 100. */
  shares: number[];
}

/** Deterministic mock data — % breakdown of access status per document type. */
const MOCK_BREAKDOWN: DocumentTypeBreakdown[] = [
  { label: 'Article', shares: [58, 15, 1, 1, 25] },
  { label: 'Conference', shares: [41, 14, 3, 3, 39] },
  { label: 'Book chapter', shares: [18, 9, 9, 1, 63] },
  { label: 'Book', shares: [36, 19, 3, 6, 36] },
];

@Component({
  selector: 'app-selector-trend-card-view',
  templateUrl: './selector-trend-card-view.html',
  imports: [HighchartsChartModule]
})
export class SelectorTrendCardView {
  startYear = input.required<number>();
  endYear = input.required<number>();

  Highcharts: typeof Highcharts = Highcharts;
  readonly accessTypes = ACCESS_TYPES;
  readonly colors = colors;
  readonly selectedAccessType = signal(ACCESS_TYPES[0]);

  private readonly years = computed(() => {
    const years: number[] = [];
    for (let y = this.startYear(); y <= this.endYear(); y++) {
      years.push(y);
    }
    return years;
  });

  /** Latest-year share per document type for the selected access type — also drives
   *  the summary row below the chart, so it always agrees with where each line ends. */
  readonly latestShares = computed(() => {
    const accessIdx = ACCESS_TYPES.indexOf(this.selectedAccessType());
    return MOCK_BREAKDOWN.map(docType => ({ label: docType.label, value: docType.shares[accessIdx] }));
  });

  readonly chartOptions = computed<Highcharts.Options>(() => {
    const years = this.years();
    const accessIdx = ACCESS_TYPES.indexOf(this.selectedAccessType());

    return {
      chart: { type: 'line', height: 260 },
      colors,
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: years.map(String) },
      yAxis: { min: 0, title: { text: undefined } },
      tooltip: { pointFormat: '{series.name}: {point.y}%' },
      plotOptions: {
        line: { marker: { enabled: true, radius: 4 } }
      },
      legend: { enabled: false },
      series: MOCK_BREAKDOWN.map((docType, docIdx) => ({
        type: 'line' as const,
        name: docType.label,
        data: this.trendToward(docType.shares[accessIdx], years.length, docIdx * ACCESS_TYPES.length + accessIdx)
      }))
    };
  });

  selectAccessType(type: string) {
    this.selectedAccessType.set(type);
  }

  /** Deterministic mock trend line that lands exactly on endValue in the final year. */
  private trendToward(endValue: number, count: number, seed: number): number[] {
    const step = 1 + (seed % 3);
    const direction = seed % 2 === 0 ? 1 : -1;
    return Array.from({ length: count }, (_, i) =>
      Math.max(0, endValue - direction * step * (count - 1 - i))
    );
  }
}
