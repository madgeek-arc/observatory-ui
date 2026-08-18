import { Component, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  SidebarMobileToggleComponent
} from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {PageContentComponent} from "../../../../survey-tool/app/shared/page-content/page-content.component";
import { EXPLORE_INDICATORS, ExploreIndicatorConfig } from "../../../domain/explore-indicators";

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

/** Topics & indicators grouped from the real catalog, in the order each group first appears. */
const TOPIC_NAMES: string[] = [...new Set(EXPLORE_INDICATORS.map(i => i.group))];
const TOPICS: Topic[] = TOPIC_NAMES.map(group => ({
  id: group,
  name: group,
  indicators: EXPLORE_INDICATORS.filter(i => i.group === group)
}));

@Component({
  selector: 'app-custom-search',
  templateUrl: './custom-search.component.html',
  imports: [
    FormsModule,
    SidebarMobileToggleComponent,
    PageContentComponent
  ]
})

export class CustomSearchComponent {
  readonly viewName = signal('Untitled search');
  readonly viewMode = signal<'dashboard' | 'matrix'>('dashboard');

  readonly startYear = signal(2018);
  readonly endYear = signal(2024);

  readonly topics: Topic[] = TOPICS;
  readonly selectedIndicatorIds = signal<Set<string>>(new Set());
  private readonly expandedTopicIds = signal<Set<string>>(new Set());

  readonly countriesInScope = signal(0);
  readonly dataPointsCount = signal(0);

  /** Empty until the saved-views feature lands — keeps the "pick up where you
   *  left off" block ready without showing anything in the meantime. */
  readonly savedViews = signal<SavedViewCard[]>([]);

  readonly summary = computed(() => {
    const selected = this.selectedIndicatorIds();
    const topicsCount = this.topics.filter(topic =>
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
}
