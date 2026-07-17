import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UpperCasePipe } from "@angular/common";
import {
  COUNTRY_PAGE_INDICATORS, IndicatorConfig, IndicatorFormat
} from "../../../domain/country-page-indicators";
import { CountryPageIndicatorsService } from "../../country-pages/services/country-page-indicators.service";

/** Section labels in catalog order (dedup preserves first-seen order). */
const GROUP_ORDER: string[] = [...new Set(COUNTRY_PAGE_INDICATORS.map(i => i.group))];

interface IndicatorGroupView {
  group: string;
  indicators: IndicatorConfig[];
}

/**
 * Split-view left panel: a searchable accordion of every indicator, grouped by section. It is the
 * sole visibility control in split view (the on-card toggles are hidden there). All state lives in
 * the shared {@link CountryPageIndicatorsService}, so toggling here and the live preview on the
 * right stay in lockstep. Reuses the `.card-config-switch` toggle styling from explore-sidebar.less.
 */
@Component({
  selector: 'app-indicator-list',
  standalone: true,
  imports: [FormsModule, UpperCasePipe],
  templateUrl: './indicator-list.component.html',
  styleUrls: ['../../../../assets/css/explore-sidebar.less'],
})
export class IndicatorListComponent {
  protected readonly service = inject(CountryPageIndicatorsService);
}
