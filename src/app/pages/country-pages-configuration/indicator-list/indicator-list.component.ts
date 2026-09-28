import { Component, computed, ElementRef, inject, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import * as UIkit from "uikit";
import {
  COUNTRY_PAGE_INDICATORS, IndicatorConfig
} from "../../../domain/country-page-indicators";
import { CountryPageIndicatorsService } from "../../country-pages/services/country-page-indicators.service";

/** Section labels in catalog order (dedup preserves first-seen order). */
const GROUP_ORDER: string[] = [...new Set(COUNTRY_PAGE_INDICATORS.map(i => i.group))];

interface IndicatorGroupView {
  group: string;
  indicators: IndicatorConfig[];
}

/**
 * Split-view left rail: a searchable accordion of every indicator, grouped by section, and the
 * sole visibility control in split view. All *persisted* state (per-indicator visibility, the
 * Global-default lock floor) lives in the shared {@link CountryPageIndicatorsService}, so toggling
 * here and the live preview on the right stay in lockstep. Only the local UI state — the search
 * term and which groups are expanded — is owned by this component.
 *
 * Reuses the `.card-config-switch` toggle styling from explore-sidebar.less.
 */
@Component({
  selector: 'app-indicator-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './indicator-list.component.html',
  styleUrls: ['../../../../assets/css/explore-sidebar.less'],
})
export class IndicatorListComponent {
  protected readonly service = inject(CountryPageIndicatorsService);

  /** The `<ul uk-accordion>` element, so the bulk buttons can drive UIkit's accordion API. */
  private readonly accordionRef = viewChild<ElementRef<HTMLElement>>('accordion');

  protected readonly search = signal('');
  private readonly expanded = signal<Set<string>>(new Set());
  protected readonly totalCount = COUNTRY_PAGE_INDICATORS.length;
  protected readonly visibleCount = computed(() =>
    COUNTRY_PAGE_INDICATORS.filter(i => this.service.isVisible(i.id)).length
  );

  /**
   * Catalog grouped by section, filtered by the search term. A group survives if its own name
   * matches or any of its indicators match; only the matching indicators are kept within it.
   */
  protected readonly groups = computed<IndicatorGroupView[]>(() => {
    const term = this.search().trim().toLowerCase();
    return GROUP_ORDER
      .map(group => {
        const all = COUNTRY_PAGE_INDICATORS.filter(i => i.group === group);
        if (!term || group.toLowerCase().includes(term)) {
          return { group, indicators: all };
        }
        return { group, indicators: all.filter(i => i.label.toLowerCase().includes(term)) };
      })
      .filter(g => g.indicators.length > 0);
  });

  protected isExpanded(group: string): boolean {
    return this.expanded().has(group);
  }

  protected toggleExpanded(group: string): void {
    const next = new Set(this.expanded());
    if (next.has(group)) {
      next.delete(group);
    } else {
      next.add(group);
    }
    this.expanded.set(next);
  }

  protected expandAll(): void {
    this.setAllOpen(true);
    this.expanded.set(new Set(this.groups().map(g => g.group)));
  }

  protected collapseAll(): void {
    this.setAllOpen(false);
    this.expanded.set(new Set());
  }

  /**
   * Drive every accordion item to the desired open state through UIkit's accordion API. The
   * `expanded` signal (which powers the active styling) is kept in step by the callers above.
   */
  private setAllOpen(open: boolean): void {
    const ul = this.accordionRef()?.nativeElement;
    if (!ul) {
      return;
    }
    const accordion = UIkit.accordion(ul);
    Array.from(ul.children).forEach((li, index) => {
      if (li.classList.contains('uk-open') !== open) {
        accordion.toggle(index, false);
      }
    });
  }

  protected groupEnabled(group: string): boolean {
    return this.service.groupVisibleCount(group) > 0;
  }

  /**
   * Group-level toggle: flip every unlocked indicator in the group to a single target state —
   * fully off when anything is currently on, otherwise fully on. Locked indicators (hidden by the
   * Global default in country scope) are left untouched.
   */
  protected toggleGroup(group: string): void {
    const target = !this.groupEnabled(group);
    for (const ind of COUNTRY_PAGE_INDICATORS) {
      if (ind.group === group
          && this.service.isVisible(ind.id) !== target
          && !this.service.isLocked(ind.id)) {
        this.service.toggle(ind.id);
      }
    }
  }
}
