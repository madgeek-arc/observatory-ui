import {
  AfterViewChecked, Component, ElementRef, computed, inject, input, signal, viewChild
} from "@angular/core";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";

/**
 * Wraps a single Country Pages "card" and drives its visibility + the admin control cluster.
 *
 * The same section components render both publicly and inside the admin config page, so this
 * wrapper centralises the dual behaviour:
 *  - config mode: render the projected card + a control cluster (Public / edit / visibility
 *    toggle) anchored to the card's top-right corner. Only the toggle is active for now.
 *  - public mode: render the projected card only when the indicator is visible.
 *
 * A card with no data for the selected country projects nothing, so the whole host is hidden
 * (no empty shell, no stray toggle).
 *
 * Usage: <app-card-config indicatorId="25"><app-info-card .../></app-card-config>
 */
@Component({
  selector: 'app-card-config',
  standalone: true,
  templateUrl: './card-config.component.html',
  styleUrls: ['../../../../assets/css/explore-sidebar.less'],
  host: {
    '[class.card-config-hidden]': '!cardVisible()',
    '[class.card-config-dimmed]': 'showHidden()',
  },
})
export class CardConfigComponent implements AfterViewChecked {
  protected readonly service = inject(CountryPageIndicatorsService);

  /** Catalog id of the wrapped card — see COUNTRY_PAGE_INDICATORS. */
  readonly indicatorId = input.required<string>();

  /** Colour class of the wrapped card (e.g. "eosc-sb visualisation-card"), so the no-data
   *  placeholder matches the real card's colour. */
  readonly colorClass = input<string>('');

  private readonly slotRef = viewChild.required<ElementRef<HTMLElement>>('slot');

  /** Whether the projected card actually rendered anything (i.e. there is data to show). */
  protected readonly hasContent = signal(false);

  /**
   * Global-default scope only: show a "No data available" placeholder for cards whose backing
   * country (France) has no data, so every indicator stays togglable. A country override keeps
   * the old behaviour — a card with no data renders nothing.
   */
  protected readonly showPlaceholder = computed(() =>
    this.service.mode() === 'config'
    && this.service.editingScope() === 'global'
    && !this.hasContent()
  );

  /** Shown when there is content and (config mode, or the indicator is toggled visible). */
  protected readonly cardVisible = computed(() =>
    this.service.mode() === 'config'
      ? this.hasContent() || this.showPlaceholder()
      : this.hasContent() && this.service.isVisible(this.indicatorId())
  );

  /**
   * The on-card control cluster exists in config mode whenever there is a card to control, in both
   * the on-page and split views — the cards render identically across views.
   */
  protected readonly showControls = computed(() =>
    this.service.mode() === 'config'
    && (this.hasContent() || this.showPlaceholder())
  );

  /**
   * In config mode, a card that is toggled off (or locked off by the Global default) stays on the
   * preview but rendered muted with a "Hidden" overlay, so the admin sees exactly what the public
   * page drops. Shown in both on-page and split views.
   */
  protected readonly showHidden = computed(() =>
    this.service.mode() === 'config'
    && this.cardVisible()
    && (this.service.isLocked(this.indicatorId()) || !this.service.isVisible(this.indicatorId()))
  );

  ngAfterViewChecked(): void {
    const has = this.slotRef().nativeElement.childElementCount > 0;
    if (has !== this.hasContent()) {
      this.hasContent.set(has);
    }
  }

  protected toggle(): void {
    this.service.toggle(this.indicatorId());
  }
}
