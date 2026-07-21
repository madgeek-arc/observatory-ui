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
  templateUrl: './section-hidden-notice.html',
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
