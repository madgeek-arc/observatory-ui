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
  },
})
export class CardConfigComponent implements AfterViewChecked {
  protected readonly service = inject(CountryPageIndicatorsService);

  /** Catalog id of the wrapped card — see COUNTRY_PAGE_INDICATORS. */
  readonly indicatorId = input.required<string>();

  /** Colour class of the wrapped card (e.g. "eosc-sb visualisation-card"), so the no-data
   *  placeholder matches the real card's colour. */
  readonly colorClass = input<string>('');

  private readonly wrapperRef = viewChild.required<ElementRef<HTMLElement>>('wrapper');
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

  /** The control cluster only exists in config mode, and only when there is a card to control. */
  protected readonly showControls = computed(() =>
    this.service.mode() === 'config' && (this.hasContent() || this.showPlaceholder())
  );

  ngAfterViewChecked(): void {
    const has = this.slotRef().nativeElement.childElementCount > 0;
    if (has !== this.hasContent()) {
      this.hasContent.set(has);
    }
    if (this.cardVisible()) {
      this.positionControls();
    }
  }

  /**
   * Anchor the control cluster to the real `.uk-card` box, not the wrapper — full-width section
   * cards centre their card inside a narrower container, so wrapper-relative top/right would land
   * the controls at the section edge instead of on the card.
   */
  private positionControls(): void {
    const wrapper = this.wrapperRef().nativeElement;
    const controls = wrapper.querySelector<HTMLElement>('.card-config-controls');
    const card = this.wrapperRef().nativeElement.querySelector<HTMLElement>('.uk-card');
    if (!controls || !card) {
      return;
    }
    const wrapperRect = wrapper.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const top = `${Math.max(cardRect.top - wrapperRect.top, 0) + 8}px`;
    const right = `${Math.max(wrapperRect.right - cardRect.right, 0) + 8}px`;
    if (controls.style.top !== top) {
      controls.style.top = top;
    }
    if (controls.style.right !== right) {
      controls.style.right = right;
    }
  }

  protected toggle(): void {
    this.service.toggle(this.indicatorId());
  }
}
