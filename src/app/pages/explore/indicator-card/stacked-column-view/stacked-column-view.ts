import { Component, computed, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { colors } from "../../../../domain/chart-color-palette";

/** Stacked breakdown categories, first-to-last = top-to-bottom in the column
 *  (reversedStacks below puts the first-defined series on top). Order matches
 *  the palette so each category's legend swatch is its actual chart color. */
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
  selector: 'app-stacked-column-view',
  templateUrl: './stacked-column-view.html',
  imports: [HighchartsChartModule]
})
export class StackedColumnView {
  // Bound by indicator-card for every TIME_RANGE view, but this breakdown-by-document-type
  // mock doesn't vary by year — kept only to satisfy the shared parent template contract.
  startYear = input.required<number>();
  endYear = input.required<number>();

  Highcharts: typeof Highcharts = Highcharts;
  readonly accessTypes = ACCESS_TYPES;
  readonly colors = colors;

  /** One chart, one category per document type — each category is its own stacked column. */
  readonly chartOptions = computed<Highcharts.Options>(() => ({
    chart: { type: 'column', height: 240 },
    colors,
    title: { text: undefined },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
      categories: MOCK_BREAKDOWN.map(docType => docType.label),
      reversedStacks: true,
      lineWidth: 0,
      tickLength: 0,
      labels: { rotation: 0, style: { fontSize: '11px' } }
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: undefined },
      gridLineWidth: 1
    },
    tooltip: {
      pointFormat: '{series.name}: {point.y}%'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: '#FFFFFF',
          formatter: function (): string | null {
            return (this.point.y ?? 0) >= 5 ? `${this.point.y}%` : null;
          }
        }
      }
    },
    legend: { enabled: false },
    series: ACCESS_TYPES.map((name, idx) => ({
      type: 'column' as const,
      name,
      data: MOCK_BREAKDOWN.map(docType => docType.shares[idx])
    }))
  }));
}
