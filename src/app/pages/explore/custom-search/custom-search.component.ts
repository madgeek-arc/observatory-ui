import { Component, DestroyRef, computed, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {
  SidebarMobileToggleComponent
} from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {PageContentComponent} from "../../../../survey-tool/app/shared/page-content/page-content.component";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { ExploreIndicatorConfig } from "../../../domain/explore-indicators";
import { countries } from "../../../domain/countries";
import { CustomSearchService, DashboardItem } from "./services/custom-search.service";
import { IndicatorCard} from "../indicator-card/indicator-card";
import {RouterLink} from "@angular/router";

interface SavedViewCard {
  id: string;
  name: string;
  shared: boolean;
  indicatorsCount: number;
  topicsCount: number;
  countriesLabel: string;
  updated: string;
}

interface Topic {
  id: string;
  name: string;
  indicators: ExploreIndicatorConfig[];
}

interface Country {
  id: string;
  name: string;
}


@Component({
  selector: 'app-custom-search',
  templateUrl: './custom-search.component.html',
  imports: [
    FormsModule,
    SidebarMobileToggleComponent,
    PageContentComponent,
    IndicatorCard,
    RouterLink
  ]
})

export class CustomSearchComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly stakeholdersService = inject(StakeholdersService);
  private readonly customSearchService = inject(CustomSearchService);

  readonly viewName = signal('Untitled search');
  readonly viewMode = signal<'dashboard' | 'matrix'>('dashboard');

  readonly startYear = signal(2018);
  readonly endYear = signal(2024);

  readonly selectedIndicatorIds = signal<Set<string>>(new Set());
  private readonly expandedTopicIds = signal<Set<string>>(new Set());

  readonly geographyScope = signal<'all' | 'select'>('all');
  readonly availableCountries = signal<Country[]>([]);
  readonly selectedCountryIds = signal<Set<string>>(new Set());
  readonly countrySearchTerm = signal('');
  readonly indicators = toSignal(
    this.customSearchService.getPreDefinedIndicators(),
    { initialValue: [] as ExploreIndicatorConfig[] }
  );

  readonly dashboardItems = toSignal(
    this.customSearchService.getDashboard(),
    { initialValue: [] as DashboardItem[] }
  );

  readonly selectedIndicatorCards = computed(() =>
    this.indicators().filter(i => this.selectedIndicatorIds().has(i.id))
  );

  readonly topics = computed<Topic[]>(() => {
    const list = this.indicators();
    const names = [...new Set(list.map(i => i.group))];
    return names.map(group => ({
      id: group,
      name: group,
      indicators: list.filter(i => i.group === group)
    }));
  });

  readonly countriesInScope = computed(() =>
    this.geographyScope() === 'all' ? this.availableCountries().length : this.selectedCountryIds().size
  );
  readonly dataPointsCount = signal(0);

  /** Empty until the saved-views feature lands — keeps the "pick up where you
   *  left off" block ready without showing anything in the meantime. */
  readonly savedViews = signal<SavedViewCard[]>([]);

  constructor() {
    this.stakeholdersService.getEOSCSBCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(codes => {
        const list = codes
          .map(code => countries.find(c => c.id === code))
          .filter((c): c is Country => !!c)
          .sort((a, b) => a.name.localeCompare(b.name));
        this.availableCountries.set(list);
      });

    effect(() => {
      const items = this.dashboardItems();
      if (items.length > 0) {
        this.selectedIndicatorIds.set(new Set(items.map(item => item.id)));
      }
    });
  }

  readonly summary = computed(() => {
    const selected = this.selectedIndicatorIds();
    const topicsCount = this.topics().filter(topic =>
      topic.indicators.some(indicator => selected.has(indicator.id))
    ).length;

    return {
      indicators: selected.size,
      topics: topicsCount,
      countries: this.countriesInScope(),
      dataPoints: this.dataPointsCount(),
      yearsLabel: `${this.startYear()}–${this.endYear()}`
    };
  });

  saveView() {
    const savedById = new Map(this.dashboardItems().map(item => [item.id, item]));
    const itemsToSave: DashboardItem[] = this.selectedIndicatorCards()
      .map(indicator => {
        const saved = savedById.get(indicator.id);
        return saved

      });

    this.customSearchService.saveDashboard(itemsToSave).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  toggleIndicator(id: string) {
    this.selectedIndicatorIds.update(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isIndicatorSelected(id: string): boolean {
    return this.selectedIndicatorIds().has(id);
  }

  selectedCountForTopic(topic: Topic): number {
    const selected = this.selectedIndicatorIds();
    return topic.indicators.filter(indicator => selected.has(indicator.id)).length;
  }

  isTopicFullySelected(topic: Topic): boolean {
    const selected = this.selectedIndicatorIds();
    return topic.indicators.every(indicator => selected.has(indicator.id));
  }

  toggleSelectAllInTopic(topic: Topic) {
    const allSelected = this.isTopicFullySelected(topic);
    this.selectedIndicatorIds.update(current => {
      const next = new Set(current);
      for (const indicator of topic.indicators) {
        allSelected ? next.delete(indicator.id) : next.add(indicator.id);
      }
      return next;
    });
  }

  isTopicExpanded(id: string): boolean {
    return this.expandedTopicIds().has(id);
  }

  toggleTopic(id: string) {
    this.expandedTopicIds.update(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  setStartYear(value: number) {
    if (Number.isNaN(value)) {
      return;
    }
    this.startYear.set(Math.min(value, this.endYear()));
  }

  setEndYear(value: number) {
    if (Number.isNaN(value)) {
      return;
    }
    this.endYear.set(Math.max(value, this.startYear()));
  }

  filteredCountries(): Country[] {
    const term = this.countrySearchTerm().trim().toLowerCase();
    const list = this.availableCountries();
    return term ? list.filter(country => country.name.toLowerCase().includes(term)) : list;
  }

  isCountrySelected(id: string): boolean {
    return this.selectedCountryIds().has(id);
  }

  toggleCountry(id: string) {
    this.selectedCountryIds.update(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /** Selects every country matching the current search term, not the whole list. */
  selectAllFilteredCountries() {
    const filtered = this.filteredCountries();
    this.selectedCountryIds.update(current => {
      const next = new Set(current);
      filtered.forEach(country => next.add(country.id));
      return next;
    });
  }

  clearSelectedCountries() {
    this.selectedCountryIds.set(new Set());
  }
  clearAllIndicators() {
    this.selectedIndicatorIds.set(new Set());
  }
}
