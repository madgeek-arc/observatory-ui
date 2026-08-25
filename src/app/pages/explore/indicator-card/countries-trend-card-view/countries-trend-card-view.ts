import { Component, computed, input } from "@angular/core";
import { HighchartsChartModule } from "highcharts-angular";
import * as Highcharts from "highcharts";
import { countries } from "../../../../domain/countries";

@Component({
  selector: 'app-countries-trend-card-view',
  templateUrl: './countries-trend-card-view.html',
  imports: [HighchartsChartModule]
})
export class CountriesTrendCardView {
  startYear = input.required<number>();
  endYear = input.required<number>();
  selectedCountryIds = input.required<Set<string>>();

  Highcharts: typeof Highcharts = Highcharts;

  readonly mockTrendYears = computed(() => {
    const years: number[] = [];
    for (let y = this.startYear(); y <= this.endYear(); y++) {
      years.push(y);
    }
    return years;
  });

  readonly selectedCountries = computed(() =>
    [...this.selectedCountryIds()]
      .map(id => countries.find(c => c.id === id))
      .filter((c): c is { id: string; name: string } => !!c)
  );

  readonly mockTrendChartOptions = computed<Highcharts.Options>(() => ({
    chart: { type: 'line', height: 200 },
    title: { text: undefined },
    credits: { enabled: false },
    exporting: { enabled: false },
    plotOptions: { line: { marker: { enabled: false } } },
    xAxis: { categories: this.mockTrendYears().map(String) },
    yAxis: { title: { text: undefined } },
    series: this.selectedCountries().map((country, idx) => ({
      type: 'line' as const,
      name: country.name,
      data: this.mockTrendYears().map((year, i) => 40 + idx * 10 + i * 2)
    }))
  }));
}
