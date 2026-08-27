import { Component, computed, input } from "@angular/core";
import { ChartsModule } from "../../../../shared/charts/charts.module";
import { CategorizedAreaData, Series } from "../../../../domain/categorizedAreaData";

@Component({
  selector: 'app-policy-map-card-view',
  templateUrl: './policy-map-card-view.html',
  imports: [ChartsModule]
})
export class PolicyMapCardView {
  startYear = input.required<number>();
  endYear = input.required<number>();

  readonly isSnapshot = computed(() => this.startYear() === this.endYear());

  readonly mockTotalCountries = 30;

  readonly mockMapData = computed<CategorizedAreaData>(() => {
    const yes = new Series('Has policy', true);
    yes.showInLegend = true;
    yes.data = ['AT', 'BE', 'NL', 'FR', 'DE', 'DK', 'FI', 'SE', 'IE', 'LU', 'PT', 'ES', 'IT', 'GR', 'PL', 'CZ', 'HU', 'SK']
      .map(code => ({ code }));

    const no = new Series('No policy', false);
    no.showInLegend = true;
    no.color = getComputedStyle(document.documentElement).getPropertyValue('--eosc-observatory-secondary-color');
    no.data = ['RO', 'BG', 'HR', 'SI', 'EE', 'LV', 'LT', 'CY', 'MT']
      .map(code => ({ code }));

    const data = new CategorizedAreaData();
    data.series = [yes, no];
    return data;
  });

  readonly mockPolicyCount = computed(() => this.mockMapData().series[0].data.length);
}
