import { Component, computed, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";

@Component({
  selector: 'app-eu-trend-card-view',
  templateUrl: './eu-trend-card-view.html',
  imports: [HighchartsChartModule]
})
export class EuTrendCardView {
  startYear = input.required<number>();
  endYear = input.required<number>();

  Highcharts: typeof Highcharts = Highcharts;

  readonly mockTrendYears = computed(() => {
    const years: number[] = [];
    for (let y = this.startYear(); y <= this.endYear(); y++) {
      years.push(y);
    }
    return years;
  });

  readonly mockTrendValues = computed(() =>
    this.mockTrendYears().map((year, i) => 50 + i * 3)
  );

  readonly mockTrendChartOptions = computed<Highcharts.Options>(() => ({
    chart: { type: 'line', height: 200 },
    title: { text: undefined },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: { categories: this.mockTrendYears().map(String) },
    yAxis: { title: { text: undefined } },
    series: [{ type: 'line', name: 'EU average', data: this.mockTrendValues() }]
  }));
}
