import { Component, computed, inject, input } from "@angular/core";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";

/**
 * In-flow notice a section renders at the top of its own content (below the title, above the first
 * card row) while the whole section is toggled off in the admin config. The section content still
 * shows below it — the notice is informational, not a replacement; on the public page the section
 * is dropped entirely instead.
 *
 * Self-gating: it reads the shared service directly, so a section only needs to drop
 * `<app-section-hidden-notice sectionName="…">` in — no visibility or restore wiring per section.
 * Renders nothing outside config mode or when the section is visible. Shown identically in the
 * on-page and split views. Styling reuses the global classes in eosc-obs-general-custom.less.
 */
@Component({
  selector: 'app-section-hidden-notice',
  standalone: true,
  template: `
    @if (show()) {
      <div class="section-hidden-notice uk-flex uk-flex-between uk-flex-middle">
        <div class="uk-flex uk-flex-middle">
          <span class="section-hidden-notice-icon" data-uk-icon="icon: ban; ratio: 1.2"></span>
          <div class="uk-margin-small-left">
            <div class="section-hidden-notice-title">This section is hidden from the live page</div>
            <div class="section-hidden-notice-text">
              Visitors won't see &ldquo;{{ sectionName() }}&rdquo; or its left-nav entry.
              Toggle the section on to restore it.
            </div>
          </div>
        </div>
        <button type="button" class="uk-button section-hidden-restore-btn"
                (click)="service.toggleSection(sectionName())">
          Restore section
        </button>
      </div>
    }
  `,
})
export class SectionHiddenNoticeComponent {
  protected readonly service = inject(CountryPageIndicatorsService);

  /** This section's catalog `group` label. */
  readonly sectionName = input.required<string>();

  /** Only in the admin config preview, and only while this section is toggled off. */
  protected readonly show = computed(() =>
    this.service.mode() === 'config' && this.service.isSectionHidden(this.sectionName())
  );
}
