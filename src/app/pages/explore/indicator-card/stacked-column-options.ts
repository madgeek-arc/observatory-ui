import * as Highcharts from "highcharts";
import { colors } from "../../../domain/chart-color-palette";
import { renderLogo } from "../../../shared/charts/highcharts-functions";
import { axisLabelFormatter, formatCompactNumber } from "../../../domain/format-indicator-value";

/**
 * Stacked column chart options for Custom Search cards. Copies the layout of the shared
 * <app-stacked-column> (logo, export menu, stacking) — that component is also used by Country Pages
 * and the dashboards and formats numbers its own way, so Custom Search builds the options here
 * to apply its number rules (axis, tooltip) without changing those pages.
 */
export function stackedColumnOptions(
  categories: string[],
  series: Highcharts.SeriesColumnOptions[],
  height: number,
  legend: Highcharts.LegendOptions = { backgroundColor: '#FFFFFF' }
): Highcharts.Options {
  return {
    colors,
    chart: {
      type: 'column',
      height,
      spacingBottom: 50,
      events: {
        load: function () {
          renderLogo(this.renderer, this.chartWidth, this.chartHeight);
        }
      }
    },
    title: { text: undefined },
    credits: { enabled: false },
    exporting: {
      enabled: true,
      sourceWidth: 1000,
      sourceHeight: height,
      chartOptions: { plotOptions: { series: { animation: false } } }
    },
    xAxis: {
      categories,
      labels: { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
    },
    yAxis: {
      min: 0,
      title: { text: undefined },
      labels: { formatter: axisLabelFormatter('number') },
      stackLabels: { enabled: false }
    },
    tooltip: {
      headerFormat: '<b>{point.key}</b><br/>',
      pointFormatter: function () {
        return `${this.series.name}: ${formatCompactNumber(this.y ?? 0)}<br/>Total: ${formatCompactNumber(this.total ?? 0)}`;
      }
    },
    plotOptions: {
      column: { stacking: 'normal', dataLabels: { enabled: false } }
    },
    legend,
    series
  };
}
